"use server";

import { and, eq, gte, inArray, sql, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditValues } from "@/lib/audit/log";
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
import {
  MAX_LINES,
  MAX_QTY,
  POS_METHODS,
  vatOf,
  type PosMethod,
} from "@/lib/pos/settings";
import { requirePermission } from "@/lib/rbac/guard";

class SaleError extends Error {}

export async function openTill(fd: FormData) {
  const staff = await requirePermission("pos:create");
  const float = parseRand(String(fd.get("float") ?? ""));
  const till = String(fd.get("till") ?? "Till 1").trim().slice(0, 30) || "Till 1";
  if (float === null || float > 10_000_000) redirect("/admin/pos?notice=float");

  let failed = false;
  try {
    await db.transaction(async (tx) => {
      const [s] = await tx
        .insert(posSessions)
        .values({ till, openedBy: staff.user.id, openingFloatCents: float })
        .returning({ id: posSessions.id });
      await tx
        .insert(auditLog)
        .values(auditValues(staff.user, "pos.session.open", "pos_session", s.id, null, { till, floatCents: float }));
    });
  } catch {
    failed = true; // most likely you already have an open till
  }
  revalidatePath("/admin/pos");
  redirect(failed ? "/admin/pos?notice=open" : "/admin/pos");
}

export async function closeTill(fd: FormData) {
  const staff = await requirePermission("pos:create");
  const counted = parseRand(String(fd.get("counted") ?? ""));
  if (counted === null) redirect("/admin/pos/close?notice=counted");

  let id = "";
  await db.transaction(async (tx) => {
    const [s] = await tx
      .select()
      .from(posSessions)
      .where(and(eq(posSessions.openedBy, staff.user.id), eq(posSessions.status, "open")));
    if (!s) return;
    id = s.id;

    const [c] = await tx
      .select({ total: sum(payments.amountCents) })
      .from(payments)
      .innerJoin(orders, eq(orders.id, payments.orderId))
      .where(
        and(
          eq(orders.posSessionId, s.id),
          eq(payments.method, "cash"),
          eq(payments.status, "succeeded")
        )
      );

    // Cash handed back to customers from this till.
    const [rf] = await tx
      .select({ total: sum(refunds.amountCents) })
      .from(refunds)
      .innerJoin(payments, eq(payments.id, refunds.paymentId))
      .where(
        and(
          eq(refunds.posSessionId, s.id),
          eq(refunds.status, "paid"),
          eq(payments.method, "cash")
        )
      );

    const cashRefunds = Number(rf?.total ?? 0);
    const expected = s.openingFloatCents + Number(c?.total ?? 0) - cashRefunds;

    await tx
      .update(posSessions)
      .set({
        status: "closed",
        closedBy: staff.user.id,
        closedAt: new Date(),
        expectedCashCents: expected,
        countedCashCents: counted,
      })
      .where(eq(posSessions.id, s.id));
    await tx.insert(auditLog).values(
      auditValues(staff.user, "pos.session.close", "pos_session", s.id, null, {
        expectedCents: expected,
        countedCents: counted,
        cashRefundsCents: cashRefunds,
        differenceCents: counted - expected,
      })
    );
  });

  revalidatePath("/admin/pos");
  redirect(id ? `/admin/pos/sessions/${id}` : "/admin/pos");
}

export type SaleInput = {
  items: { productId: string; qty: number }[];
  method: string;
  tendered: string;
  reference: string;
};
export type SaleResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export async function createSale(input: SaleInput): Promise<SaleResult> {
  const staff = await requirePermission("pos:create");

  if (!Array.isArray(input.items) || input.items.length === 0)
    return { ok: false, error: "The cart is empty." };
  if (input.items.length > MAX_LINES)
    return { ok: false, error: "Too many different items in one sale." };
  if (!POS_METHODS.includes(input.method as PosMethod))
    return { ok: false, error: "Choose a payment method." };
  const method = input.method as PosMethod;
  const reference = String(input.reference ?? "").trim().slice(0, 60);

  // Merge duplicates and validate quantities.
  const wanted = new Map<string, number>();
  for (const l of input.items) {
    const q = Number(l.qty);
    if (typeof l.productId !== "string" || !Number.isInteger(q) || q < 1 || q > MAX_QTY)
      return { ok: false, error: "A quantity in the cart is not valid." };
    wanted.set(l.productId, (wanted.get(l.productId) ?? 0) + q);
  }
  const ids = [...wanted.keys()];

  try {
    const orderId = await db.transaction(async (tx) => {
      const [session] = await tx
        .select()
        .from(posSessions)
        .where(and(eq(posSessions.openedBy, staff.user.id), eq(posSessions.status, "open")));
      if (!session) throw new SaleError("Open your till before selling.");

      // Prices always come from the database, never from the browser.
      const rows = await tx
        .select()
        .from(products)
        .where(and(inArray(products.id, ids), eq(products.status, "live")));
      if (rows.length !== ids.length)
        throw new SaleError("A product in the cart is no longer available. Refresh the page.");

      const lines = rows.map((p) => {
        const qty = wanted.get(p.id)!;
        return { p, qty, lineTotal: p.priceCents * qty };
      });
      const total = lines.reduce((n, l) => n + l.lineTotal, 0);
      if (total <= 0) throw new SaleError("The total must be more than zero.");

      if (method === "cash") {
        const tendered = parseRand(input.tendered);
        if (tendered === null || tendered < total)
          throw new SaleError("The cash received is less than the total.");
      } else if (reference.length < 3) {
        throw new SaleError("Enter the card slip or EFT reference.");
      }

      const [order] = await tx
        .insert(orders)
        .values({
          channel: "pos",
          status: "paid",
          customerName: "Walk-in",
          cashierId: staff.user.id,
          posSessionId: session.id,
          subtotalCents: total,
          discountCents: 0,
          vatCents: vatOf(total),
          vatIncluded: true,
          totalCents: total,
          paidAt: new Date(),
        })
        .returning({ id: orders.id });

      await tx.insert(orderItems).values(
        lines.map((l) => ({
          orderId: order.id,
          productId: l.p.id,
          sellerId: l.p.sellerId,
          name: l.p.name,
          isDigital: l.p.isDigital,
          unitPriceCents: l.p.priceCents,
          quantity: l.qty,
          lineTotalCents: l.lineTotal,
        }))
      );

      // Deduct tracked stock. The condition stops two tills overselling.
      for (const l of lines) {
        if (!l.p.trackStock) continue;
        const done = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${l.qty}`, updatedAt: new Date() })
          .where(and(eq(products.id, l.p.id), gte(products.stock, l.qty)))
          .returning({ id: products.id });
        if (done.length === 0)
          throw new SaleError(`Not enough stock for ${l.p.name}.`);
        await tx.insert(stockMovements).values({
          productId: l.p.id,
          delta: -l.qty,
          reason: "sale",
          orderId: order.id,
          createdBy: staff.user.id,
        });
      }

      await tx.insert(payments).values({
        orderId: order.id,
        method,
        status: "succeeded",
        amountCents: total,
        providerRef: method === "cash" ? null : reference,
        recordedBy: staff.user.id,
        confirmedAt: new Date(),
      });

      await tx.insert(auditLog).values(
        auditValues(staff.user, "pos.sale", "order", order.id, null, {
          totalCents: total,
          method,
        })
      );
      return order.id;
    });

    revalidatePath("/admin/pos");
    return { ok: true, orderId };
  } catch (e) {
    if (e instanceof SaleError) return { ok: false, error: e.message };
    const msg = `${(e as Error).message ?? ""} ${
      (e as { cause?: { message?: string } }).cause?.message ?? ""
    }`;
    if (msg.includes("payments_provider_ref_idx"))
      return { ok: false, error: "That reference was already used on another sale." };
    return { ok: false, error: "The sale could not be saved. Nothing was charged. Please try again." };
  }
}