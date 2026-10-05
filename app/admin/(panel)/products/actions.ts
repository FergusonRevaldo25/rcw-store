"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProductState } from "@/app/seller/products/actions";
import { auditValues } from "@/lib/audit/log";
import {
  inScope,
  isSuperAdmin,
  listAllowedCategories,
  slugify,
} from "@/lib/catalogue/admin";
import { getVisibleCategoryIds } from "@/lib/catalogue/queries";
import { db } from "@/lib/db";
import {
  auditLog,
  productImages,
  products,
  stockMovements,
} from "@/lib/db/schema";
import { requireFresh } from "@/lib/auth/fresh";
import { requirePermission } from "@/lib/rbac/guard";
import { validateProduct } from "@/lib/validation/product";

// ---------- Review (unchanged behaviour) ----------

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

// ---------- Create and edit RCW products ----------

export async function createAdminProduct(
  _prev: ProductState,
  fd: FormData
): Promise<ProductState> {
  const staff = await requirePermission("products:create");
  const visible = await getVisibleCategoryIds(staff.user.id);
  const cats = await listAllowedCategories(visible);
  const parsed = validateProduct(fd, new Set(cats.map((c) => c.id)));
  if (!parsed.ok) return { errors: parsed.errors, values: parsed.values };
  const d = parsed.data;
  const stock = d.trackStock ? d.stock : 0;

  let id = "";
  try {
    await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(products)
        .values({
          slug: slugify(d.name),
          name: d.name,
          description: d.description,
          priceCents: d.priceCents,
          categoryId: d.categoryId,
          sellerId: null, // an RCW-owned product
          isDigital: d.isDigital,
          trackStock: d.trackStock,
          stock,
          status: "draft",
          createdBy: staff.user.id,
        })
        .returning({ id: products.id });
      id = row.id;
      await tx
        .insert(productImages)
        .values({ productId: id, url: d.image, alt: d.name, position: 0 });
      if (stock > 0) {
        await tx.insert(stockMovements).values({
          productId: id,
          delta: stock,
          reason: "restock",
          note: "Opening stock",
          createdBy: staff.user.id,
        });
      }
      await tx.insert(auditLog).values(
        auditValues(staff.user, "product.create", "product", id, null, {
          name: d.name,
          priceCents: d.priceCents,
          categoryId: d.categoryId,
        })
      );
    });
  } catch {
    return { error: "We could not save the product. Please try again." };
  }

  revalidatePath("/admin/products");
  redirect(`/admin/products/${id}?notice=created`);
}

export async function updateAdminProduct(
  id: string,
  _prev: ProductState,
  fd: FormData
): Promise<ProductState> {
  const staff = await requirePermission("products:create");
  const visible = await getVisibleCategoryIds(staff.user.id);
  const cats = await listAllowedCategories(visible);
  const parsed = validateProduct(fd, new Set(cats.map((c) => c.id)));
  if (!parsed.ok) return { errors: parsed.errors, values: parsed.values };
  const d = parsed.data;
  const stock = d.trackStock ? d.stock : 0;

  let problem: string | null = null;
  try {
    problem = await db.transaction(async (tx): Promise<string | null> => {
      const [p] = await tx
        .select()
        .from(products)
        .where(eq(products.id, id))
        .for("update");
      if (!p || p.sellerId !== null) return "Product not found.";
      if (
        !inScope(visible, p.categoryId) ||
        (p.createdBy !== staff.user.id && !staff.permissions.has("products:edit"))
      )
        return "You cannot edit this product.";
      if (p.status !== "draft" && p.status !== "rejected")
        return "Take the product offline before editing it.";

      await tx
        .update(products)
        .set({
          name: d.name,
          description: d.description,
          priceCents: d.priceCents,
          categoryId: d.categoryId,
          isDigital: d.isDigital,
          trackStock: d.trackStock,
          stock,
          status: "draft",
          rejectionReason: null,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id));
      await tx.delete(productImages).where(eq(productImages.productId, id));
      await tx
        .insert(productImages)
        .values({ productId: id, url: d.image, alt: d.name, position: 0 });

      const delta = stock - p.stock;
      if (delta !== 0) {
        await tx.insert(stockMovements).values({
          productId: id,
          delta,
          reason: "adjustment",
          note: "Edited while in draft",
          createdBy: staff.user.id,
        });
      }
      await tx.insert(auditLog).values(
        auditValues(
          staff.user,
          "product.update",
          "product",
          id,
          { name: p.name, priceCents: p.priceCents, stock: p.stock },
          { name: d.name, priceCents: d.priceCents, stock }
        )
      );
      return null;
    });
  } catch {
    return { error: "We could not save your changes. Please try again." };
  }

  if (problem) return { error: problem };
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/products");
  return { saved: true };
}

// ---------- Status changes ----------

export async function submitForReview(fd: FormData): Promise<void> {
  const staff = await requirePermission("products:create");
  const id = String(fd.get("productId") ?? "");
  if (!id) redirect("/admin/products?notice=missing");
  const visible = await getVisibleCategoryIds(staff.user.id);

  const outcome = await db.transaction(async (tx): Promise<string> => {
    const [p] = await tx
      .select()
      .from(products)
      .where(eq(products.id, id))
      .for("update");
    if (!p || p.sellerId !== null || (p.status !== "draft" && p.status !== "rejected"))
      return "missing";
    if (
      !inScope(visible, p.categoryId) ||
      (p.createdBy !== staff.user.id && !staff.permissions.has("products:edit"))
    )
      return "scope";
    await tx
      .update(products)
      .set({
        status: "pending_review",
        submittedAt: new Date(),
        rejectionReason: null,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));
    await tx.insert(auditLog).values(
      auditValues(staff.user, "product.submit", "product", id, { status: p.status }, { status: "pending_review" })
    );
    return "submitted";
  });

  revalidatePath("/admin/products");
  redirect(
    outcome === "submitted"
      ? `/admin/products/${id}?notice=submitted`
      : `/admin/products?notice=${outcome}`
  );
}

// Super Admin only: publish your own RCW product without a second reviewer.
// The audit log records it as a self-approval.
export async function publishOwn(fd: FormData): Promise<void> {
  const staff = await requirePermission("products:create");
  const id = String(fd.get("productId") ?? "");
  if (!id) redirect("/admin/products?notice=missing");
  if (!(await isSuperAdmin(staff.user.id))) redirect("/admin/products?notice=notsuper");
  await requireFresh(`/admin/products/${id}`);

  const outcome = await db.transaction(async (tx): Promise<string> => {
    const [p] = await tx
      .select()
      .from(products)
      .where(eq(products.id, id))
      .for("update");
    if (
      !p ||
      p.sellerId !== null ||
      p.createdBy !== staff.user.id ||
      !["draft", "rejected", "pending_review"].includes(p.status)
    )
      return "missing";
    // reviewedBy stays empty on purpose: the database rule forbids the
    // creator being recorded as their own reviewer.
    await tx
      .update(products)
      .set({
        status: "live",
        reviewedAt: new Date(),
        rejectionReason: null,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));
    await tx.insert(auditLog).values(
      auditValues(staff.user, "product.self_publish", "product", id, { status: p.status }, { status: "live", selfApproved: true })
    );
    return "published";
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect(
    outcome === "published"
      ? `/admin/products/${id}?notice=published`
      : `/admin/products?notice=${outcome}`
  );
}

// Live products go back to draft so they can be edited and reviewed again.
// A creator can also withdraw their own product while it waits for review.
export async function takeOffline(fd: FormData): Promise<void> {
  const staff = await requirePermission("products:view");
  const id = String(fd.get("productId") ?? "");
  if (!id) redirect("/admin/products?notice=missing");
  const visible = await getVisibleCategoryIds(staff.user.id);

  const outcome = await db.transaction(async (tx): Promise<string> => {
    const [p] = await tx
      .select()
      .from(products)
      .where(eq(products.id, id))
      .for("update");
    if (!p || (p.status !== "live" && p.status !== "pending_review")) return "missing";
    if (!inScope(visible, p.categoryId)) return "scope";
    const reviewer = staff.permissions.has("products:edit");
    const allowed =
      p.status === "live" ? reviewer : reviewer || p.createdBy === staff.user.id;
    if (!allowed) return "scope";
    await tx
      .update(products)
      .set({ status: "draft", updatedAt: new Date() })
      .where(eq(products.id, id));
    await tx.insert(auditLog).values(
      auditValues(staff.user, "product.unpublish", "product", id, { status: p.status }, { status: "draft" })
    );
    return "offline";
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect(
    outcome === "offline"
      ? `/admin/products/${id}?notice=offline`
      : `/admin/products?notice=${outcome}`
  );
}

// ---------- Stock ----------

const ADJUST_REASONS = ["restock", "adjustment", "count"] as const;

export async function adjustStock(fd: FormData): Promise<void> {
  const staff = await requirePermission("products:view");
  if (
    !staff.permissions.has("products:edit") &&
    !staff.permissions.has("inventory:edit")
  )
    redirect("/admin/products?notice=denied");

  const id = String(fd.get("productId") ?? "");
  const delta = Number(String(fd.get("delta") ?? "").trim());
  const reason = String(fd.get("reason") ?? "");
  const note = String(fd.get("note") ?? "").trim().slice(0, 200);
  const back = `/admin/products/${id}`;
  if (
    !id ||
    !Number.isInteger(delta) ||
    delta === 0 ||
    Math.abs(delta) > 100_000 ||
    !(ADJUST_REASONS as readonly string[]).includes(reason)
  )
    redirect(`${back}?notice=stockinput`);

  const visible = await getVisibleCategoryIds(staff.user.id);

  const outcome = await db.transaction(async (tx): Promise<string> => {
    const [p] = await tx
      .select()
      .from(products)
      .where(eq(products.id, id))
      .for("update");
    if (!p || p.sellerId !== null || !p.trackStock || p.isDigital) return "missing";
    if (!inScope(visible, p.categoryId)) return "scope";

    const done = await tx
      .update(products)
      .set({ stock: sql`${products.stock} + ${delta}`, updatedAt: new Date() })
      .where(and(eq(products.id, id), sql`${products.stock} + ${delta} >= 0`))
      .returning({ stock: products.stock });
    if (done.length === 0) return "negative";

    await tx.insert(stockMovements).values({
      productId: id,
      delta,
      reason: reason as (typeof ADJUST_REASONS)[number],
      note: note || null,
      createdBy: staff.user.id,
    });
    await tx.insert(auditLog).values(
      auditValues(staff.user, "product.stock.adjust", "product", id, { stock: p.stock }, { stock: done[0].stock, delta, reason })
    );
    return "stock";
  });

  revalidatePath(back);
  revalidatePath("/admin/products");
  redirect(`${outcome === "missing" || outcome === "scope" ? "/admin/products" : back}?notice=${outcome}`);
}
