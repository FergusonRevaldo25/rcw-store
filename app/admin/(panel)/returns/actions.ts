"use server";

import { and, eq, inArray, ne, sql, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditValues, type Tx } from "@/lib/audit/log";
import { requireFresh } from "@/lib/auth/fresh";
import { db } from "@/lib/db";
import {
  auditLog,
  orderItems,
  orders,
  payments,
  posSessions,
  products,
  refunds,
  stockMovements,
} from "@/lib/db/schema";
import { parseRand } from "@/lib/pos/money";
import { requirePermission } from "@/lib/rbac/guard";

// Money already promised or handed back for an order (rejected ones do not count).
async function committedRefunds(tx: Tx, orderId: string, exceptId?: string) {
  const base = and(
    eq(refunds.orderId, orderId),
    inArray(refunds.status, ["requested", "approved", "paid"])
  );
  const [r] = await tx
    .select({ total: sum(refunds.amountCents) })
    .from(refunds)
    .where(exceptId ? and(base, ne(refunds.id, exceptId)) : base);
  return Number(r?.total ?? 0);
}

function refreshAll() {
  revalidatePath("/admin/returns");
  revalidatePath("/admin/pos");
  revalidatePath("/admin/pos/sales");
}

// Step 1: someone asks for a refund on a sale.
export async function requestRefund(fd: FormData): Promise<void> {
  const staff = await requirePermission("returns:create");
  const orderId = String(fd.get("orderId") ?? "");
  if (!orderId) redirect("/admin/returns?notice=missing");

  const back = `/admin/pos/sales/${encodeURIComponent(orderId)}`;
  const amount = parseRand(String(fd.get("amount") ?? ""));
  const reason = String(fd.get("reason") ?? "").trim().slice(0, 300);
  if (amount === null || amount <= 0) redirect(`${back}?notice=amount`);
  if (reason.length < 5) redirect(`${back}?notice=reason`);

  const outcome = await db.transaction(async (tx): Promise<string> => {
    const [o] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .for("update");
    if (!o || (o.status !== "paid" && o.status !== "fulfilled")) return "missing";

    const [p] = await tx
      .select()
      .from(payments)
      .where(and(eq(payments.orderId, o.id), eq(payments.status, "succeeded")))
      .limit(1);
    if (!p) return "missing";

    const committed = await committedRefunds(tx, o.id);
    if (amount > o.totalCents - committed) return "toomuch";

    const [r] = await tx
      .insert(refunds)
      .values({
        orderId: o.id,
        paymentId: p.id,
        amountCents: amount,
        reason,
        requestedBy: staff.user.id,
      })
      .returning({ id: refunds.id });

    await tx.insert(auditLog).values(
      auditValues(staff.user, "refund.request", "refund", r.id, null, {
        orderId: o.id,
        amountCents: amount,
        reason,
      })
    );
    return "requested";
  });

  refreshAll();
  redirect(`${back}?notice=${outcome}`);
}

// Step 2: a different person approves or rejects.
export async function decideRefund(fd: FormData): Promise<void> {
  const staff = await requirePermission("returns:approve");
  await requireFresh("/admin/returns?status=requested");
  const id = String(fd.get("refundId") ?? "");
  const decision = String(fd.get("decision") ?? "");
  const note = String(fd.get("note") ?? "").trim().slice(0, 300);
  const restock = fd.get("restock") === "on";

  if (!id || (decision !== "approve" && decision !== "reject"))
    redirect("/admin/returns?notice=missing");
  if (decision === "reject" && note.length < 5)
    redirect("/admin/returns?notice=note");

  const outcome = await db.transaction(async (tx): Promise<string> => {
    const [r] = await tx
      .select()
      .from(refunds)
      .where(eq(refunds.id, id))
      .for("update");
    if (!r || r.status !== "requested") return "missing";
    // Maker-checker: never decide your own request.
    if (r.requestedBy === staff.user.id) return "own";

    const now = new Date();
    let restocked = false;

    if (decision === "approve" && restock) {
      const [o] = await tx.select().from(orders).where(eq(orders.id, r.orderId));
      const others = await committedRefunds(tx, r.orderId, r.id);
      const [prior] = await tx
        .select({ id: stockMovements.id })
        .from(stockMovements)
        .where(
          and(eq(stockMovements.orderId, r.orderId), eq(stockMovements.reason, "refund"))
        )
        .limit(1);
      // Only a single full refund may put the whole order back on the shelf.
      if (!o || r.amountCents !== o.totalCents || others > 0 || prior) return "restock";

      const lines = await tx
        .select({
          productId: orderItems.productId,
          qty: orderItems.quantity,
          track: products.trackStock,
        })
        .from(orderItems)
        .innerJoin(products, eq(products.id, orderItems.productId))
        .where(eq(orderItems.orderId, r.orderId));

      for (const l of lines) {
        if (!l.track || !l.productId) continue;
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} + ${l.qty}`, updatedAt: now })
          .where(eq(products.id, l.productId));
        await tx.insert(stockMovements).values({
          productId: l.productId,
          delta: l.qty,
          reason: "refund",
          orderId: r.orderId,
          note: `Refund ${r.id}`,
          createdBy: staff.user.id,
        });
      }
      restocked = true;
    }

    const next = decision === "approve" ? "approved" : "rejected";
    await tx
      .update(refunds)
      .set({
        status: next,
        decidedBy: staff.user.id,
        decidedAt: now,
        decisionNote: note || null,
      })
      .where(eq(refunds.id, r.id));

    await tx.insert(auditLog).values(
      auditValues(
        staff.user,
        decision === "approve" ? "refund.approve" : "refund.reject",
        "refund",
        r.id,
        { status: r.status },
        { status: next, amountCents: r.amountCents, restocked, note: note || null }
      )
    );
    return next;
  });

  refreshAll();
  redirect(`/admin/returns?status=requested&notice=${outcome}`);
}

// Step 3: money goes back to the customer at an open till.
export async function payRefund(fd: FormData): Promise<void> {
  const staff = await requirePermission("pos:create");
  const id = String(fd.get("refundId") ?? "");
  if (!id) redirect("/admin/returns?notice=missing");

  const outcome = await db.transaction(async (tx): Promise<string> => {
    const [r] = await tx
      .select()
      .from(refunds)
      .where(eq(refunds.id, id))
      .for("update");
    if (!r || r.status !== "approved") return "missing";

    const [s] = await tx
      .select()
      .from(posSessions)
      .where(and(eq(posSessions.openedBy, staff.user.id), eq(posSessions.status, "open")));
    if (!s) return "notill";

    await tx
      .update(refunds)
      .set({ status: "paid", paidAt: new Date(), posSessionId: s.id })
      .where(eq(refunds.id, r.id));

    await tx.insert(auditLog).values(
      auditValues(
        staff.user,
        "refund.pay",
        "refund",
        r.id,
        { status: r.status },
        { status: "paid", amountCents: r.amountCents, posSessionId: s.id }
      )
    );
    return "paid";
  });

  refreshAll();
  redirect(`/admin/returns?status=approved&notice=${outcome}`);
}