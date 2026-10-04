"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auditLog, sellers, user } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac/guard";

export async function approveSeller(formData: FormData) {
  const staff = await requirePermission("sellers:approve");
  const id = String(formData.get("sellerId") ?? "");
  if (!id) return;

  await db.transaction(async (tx) => {
    const [s] = await tx.select().from(sellers).where(eq(sellers.id, id));
    if (!s || s.status === "approved") return;

    await tx
      .update(sellers)
      .set({
        status: "approved",
        rejectionReason: null,
        reviewedBy: staff.user.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(sellers.id, id));

    // Only upgrade plain customers. Never downgrade staff.
    await tx
      .update(user)
      .set({ kind: "seller" })
      .where(and(eq(user.id, s.userId), eq(user.kind, "customer")));

    await tx.insert(auditLog).values({
      actorId: staff.user.id,
      actorLabel: staff.user.email,
      action: "seller.approve",
      entityType: "seller",
      entityId: id,
      before: { status: s.status },
      after: { status: "approved" },
    });
  });

  revalidatePath("/admin/sellers");
}

export async function rejectSeller(formData: FormData) {
  const staff = await requirePermission("sellers:approve");
  const id = String(formData.get("sellerId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);
  if (!id || reason.length < 5) return;

  await db.transaction(async (tx) => {
    const [s] = await tx.select().from(sellers).where(eq(sellers.id, id));
    if (!s) return;

    await tx
      .update(sellers)
      .set({
        status: "rejected",
        rejectionReason: reason,
        reviewedBy: staff.user.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(sellers.id, id));

    await tx.insert(auditLog).values({
      actorId: staff.user.id,
      actorLabel: staff.user.email,
      action: "seller.reject",
      entityType: "seller",
      entityId: id,
      before: { status: s.status },
      after: { status: "rejected", reason },
    });
  });

  revalidatePath("/admin/sellers");
}