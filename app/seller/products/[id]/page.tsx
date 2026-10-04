import type { Metadata } from "next";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import SellerProductForm from "@/components/SellerProductForm";
import { listLiveCategories } from "@/lib/catalogue/queries";
import { db } from "@/lib/db";
import { productImages, products } from "@/lib/db/schema";
import { requireApprovedSeller } from "@/lib/seller";
import { submitProduct, updateProduct } from "../actions";

export const metadata: Metadata = { title: "Edit product | Seller" };

const notes = {
  draft: "Draft. Submit it for review when it is ready.",
  pending_review: "Waiting for review. You cannot edit it until a decision is made.",
  live: "Live on the store. Changes to live products are not available yet.",
  rejected: "Needs changes. Edit it and submit again.",
} as const;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { seller } = await requireApprovedSeller();

  const [p] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.sellerId, seller.id)));
  if (!p) notFound();

  const [img] = await db
    .select({ url: productImages.url })
    .from(productImages)
    .where(and(eq(productImages.productId, id), eq(productImages.position, 0)));

  const categories = await listLiveCategories();
  const editable = p.status === "draft" || p.status === "rejected";

  return (
    <main className="min-h-[60vh]">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/seller/products" className="text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)]">
          Back to my products
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-[var(--text)]">{p.name}</h1>
        <p role="status" className="mt-1 text-sm text-[var(--muted)]">{notes[p.status]}</p>
        {p.status === "rejected" && p.rejectionReason && (
          <p className="mt-2 rounded-lg border border-red-500/40 p-3 text-sm text-red-500">
            Reason: {p.rejectionReason}
          </p>
        )}

        <SellerProductForm
          action={updateProduct.bind(null, p.id)}
          categories={categories}
          readOnly={!editable}
          submitLabel="Save changes"
          initial={{
            name: p.name,
            description: p.description,
            priceRand: (p.priceCents / 100).toFixed(2),
            categoryId: p.categoryId,
            image: img?.url ?? "",
            stock: String(p.stock),
            isDigital: p.isDigital,
            trackStock: p.trackStock,
          }}
        />

        {editable && (
          <form action={submitProduct} className="mt-4 border-t border-[var(--border)] pt-4">
            <input type="hidden" name="productId" value={p.id} />
            <p className="mb-3 text-xs text-[var(--muted)]">
              Save any changes first. Submitting sends the saved version for review.
            </p>
            <button
              type="submit"
              className="min-h-11 rounded-full border border-[var(--border-strong)] px-6 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
            >
              Submit for review
            </button>
          </form>
        )}
      </div>
    </main>
  );
}