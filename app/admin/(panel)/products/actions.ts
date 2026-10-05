"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getVisibleCategoryIds } from "@/lib/catalogue/queries";
import { db } from "@/lib/db";
import { auditLog, products } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac/guard";

type Outcome = "ok" | "own" | "scope" | "missing";

async function review(
  formData: FormData,
  decision: "live" | "rejected"
): Promise<Outcome> {
  const staff = await requirePermission("products:edit");
  const id = String(formData.get("productId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);
  if (!id) return "missing";
  if (decision === "rejected" && reason.length < 5) return "missing";

  const visible = await getVisibleCategoryIds(staff.user.id);

  return db.transaction(async (tx): Promise<Outcome> => {
    const [p] = await tx.select().from(products).where(eq(products.id, id));
    if (!p || p.status !== "pending_review") return "missing";

    // Staff may only review categories they have access to.
    if (visible !== "all" && !visible.includes(p.categoryId)) return "scope";
    // Maker-checker: never approve or reject your own product.
    if (p.createdBy === staff.user.id) return "own";

    await tx
      .update(products)
      .set({
        status: decision,
        rejectionReason: decision === "rejected" ? reason : null,
        reviewedBy: staff.user.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    await tx.insert(auditLog).values({
      actorId: staff.user.id,
      actorLabel: staff.user.email,
      action: decision === "live" ? "product.approve" : "product.reject",
      entityType: "product",
      entityId: id,
      before: { status: p.status },
      after: decision === "live" ? { status: "live" } : { status: "rejected", reason },
    });
    return "ok";
  });
}

export async function approveProduct(formData: FormData) {
  const outcome = await review(formData, "live");
  revalidatePath("/admin/products");
  revalidatePath("/seller/products");
  if (outcome !== "ok") redirect(`/admin/products?notice=${outcome}`);
}

export async function rejectProduct(formData: FormData) {
  const outcome = await review(formData, "rejected");
  revalidatePath("/admin/products");
  revalidatePath("/seller/products");
  if (outcome !== "ok") redirect(`/admin/products?notice=${outcome}`);
}