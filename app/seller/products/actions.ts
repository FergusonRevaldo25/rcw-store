"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { listLiveCategories } from "@/lib/catalogue/queries";
import { db } from "@/lib/db";
import { auditLog, productImages, products } from "@/lib/db/schema";
import { requireApprovedSeller } from "@/lib/seller";
import {
  validateProduct,
  type ProductErrors,
  type ProductValues,
} from "@/lib/validation/product";

export type ProductState = {
  error?: string;
  errors?: ProductErrors;
  values?: ProductValues;
  saved?: boolean;
};

function slugify(s: string) {
  const base = s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
  return `${base || "product"}-${crypto.randomUUID().slice(0, 6)}`;
}

async function categoryIds() {
  return new Set((await listLiveCategories()).map((c) => c.id));
}

export async function createProduct(
  _prev: ProductState,
  formData: FormData
): Promise<ProductState> {
  const { user, seller } = await requireApprovedSeller();
  const parsed = validateProduct(formData, await categoryIds());
  if (!parsed.ok) return { errors: parsed.errors, values: parsed.values };
  const d = parsed.data;

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
          sellerId: seller.id,
          isDigital: d.isDigital,
          trackStock: d.trackStock,
          stock: d.stock,
          status: "draft",
          createdBy: user.id,
        })
        .returning({ id: products.id });
      id = row.id;
      await tx
        .insert(productImages)
        .values({ productId: id, url: d.image, alt: d.name, position: 0 });
    });
  } catch {
    return { error: "We could not save the product. Please try again." };
  }

  redirect(`/seller/products/${id}`);
}

export async function updateProduct(
  id: string,
  _prev: ProductState,
  formData: FormData
): Promise<ProductState> {
  const { seller } = await requireApprovedSeller();
  const parsed = validateProduct(formData, await categoryIds());
  if (!parsed.ok) return { errors: parsed.errors, values: parsed.values };
  const d = parsed.data;

  const [existing] = await db
    .select({ status: products.status })
    .from(products)
    .where(and(eq(products.id, id), eq(products.sellerId, seller.id)));
  if (!existing) return { error: "Product not found." };
  if (existing.status !== "draft" && existing.status !== "rejected")
    return { error: "This product can no longer be edited." };

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({
          name: d.name,
          description: d.description,
          priceCents: d.priceCents,
          categoryId: d.categoryId,
          isDigital: d.isDigital,
          trackStock: d.trackStock,
          stock: d.stock,
          status: "draft",
          rejectionReason: null,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id));
      await tx.delete(productImages).where(eq(productImages.productId, id));
      await tx
        .insert(productImages)
        .values({ productId: id, url: d.image, alt: d.name, position: 0 });
    });
  } catch {
    return { error: "We could not save your changes. Please try again." };
  }

  revalidatePath(`/seller/products/${id}`);
  revalidatePath("/seller/products");
  return { saved: true };
}

export async function submitProduct(formData: FormData) {
  const { user, seller } = await requireApprovedSeller();
  const id = String(formData.get("productId") ?? "");
  if (!id) return;

  await db.transaction(async (tx) => {
    const [p] = await tx
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.sellerId, seller.id)));
    if (!p || (p.status !== "draft" && p.status !== "rejected")) return;

    await tx
      .update(products)
      .set({
        status: "pending_review",
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    await tx.insert(auditLog).values({
      actorId: user.id,
      actorLabel: user.email,
      action: "product.submit",
      entityType: "product",
      entityId: id,
      before: { status: p.status },
      after: { status: "pending_review" },
    });
  });

  revalidatePath(`/seller/products/${id}`);
  revalidatePath("/seller/products");
}