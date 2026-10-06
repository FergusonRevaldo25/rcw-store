"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditValues } from "@/lib/audit/log";
import { db } from "@/lib/db";
import { auditLog, orders } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac/guard";

export async function markShipped(fd: FormData) {
  const staff = await requirePermission("orders:edit");
  const id = String(fd.get("orderId") ?? "");
  const tracking = String(fd.get("tracking") ?? "").trim().slice(0, 60);
  const back = `/admin/orders/${id}`;
  if (!id) redirect("/admin/orders");
  if (tracking.length < 3) redirect(`${back}?notice=tracking`);

  const ok = await db.transaction(async (tx) => {
    const [o] = await tx
      .update(orders)
      .set({
        status: "fulfilled",
        trackingRef: tracking,
        shippedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(eq(orders.id, id), eq(orders.channel, "online"), eq(orders.status, "paid"))
      )
      .returning({ id: orders.id });
    if (!o) return false;
    await tx.insert(auditLog).values(
      auditValues(staff.user, "order.ship", "order", id, { status: "paid" }, { status: "fulfilled", tracking })
    );
    return true;
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/shipping");
  redirect(`${back}?notice=${ok ? "shipped" : "cannot"}`);
}