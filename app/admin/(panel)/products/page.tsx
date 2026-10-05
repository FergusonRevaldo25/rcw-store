import type { Metadata } from "next";
import { and, asc, eq } from "drizzle-orm";
import { categoryScope, getVisibleCategoryIds } from "@/lib/catalogue/queries";
import { db } from "@/lib/db";
import { categories, productImages, products, sellers } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac/guard";
import { approveProduct, rejectProduct } from "./actions";

export const metadata: Metadata = { title: "Product review | Admin" };

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

const notices: Record<string, string> = {
  own: "You cannot review a product you created yourself. Another staff member must do it.",
  scope: "That product is outside the categories you have access to.",
  missing: "That product is no longer waiting for review, or the reason was too short.",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const staff = await requirePermission("products:view");
  const canReview = staff.permissions.has("products:edit");
  const { notice } = await searchParams;
  const visible = await getVisibleCategoryIds(staff.user.id);

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      priceCents: products.priceCents,
      stock: products.stock,
      trackStock: products.trackStock,
      isDigital: products.isDigital,
      submittedAt: products.submittedAt,
      category: categories.name,
      seller: sellers.businessName,
      image: productImages.url,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(sellers, eq(sellers.id, products.sellerId))
    .leftJoin(
      productImages,
      and(eq(productImages.productId, products.id), eq(productImages.position, 0))
    )
    .where(
      and(
        eq(products.status, "pending_review"),
        categoryScope(products.categoryId, visible)
      )
    )
    .orderBy(asc(products.submittedAt));

  return (
    <main>
      <h1 className="text-2xl font-bold text-[var(--text)]">Product review</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {rows.length} waiting for review, oldest first.
      </p>

      {notice && notices[notice] && (
        <p role="alert" className="mt-4 rounded-lg border border-red-500/40 p-3 text-sm text-red-500">
          {notices[notice]}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">Nothing to review.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((p) => (
            <li key={p.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex gap-4">
                {p.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-24 w-24 shrink-0 rounded-lg border border-[var(--border)] object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="font-semibold text-[var(--text)]">{p.name}</h2>
                    <span className="text-sm font-bold text-[var(--text)]">
                      R{(p.priceCents / 100).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    {p.category}, {p.seller ? `seller: ${p.seller}` : "RCW product"},{" "}
                    {p.isDigital ? "digital" : p.trackStock ? `${p.stock} in stock` : "stock not tracked"}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{p.description}</p>
                </div>
              </div>

              {canReview && (
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <form action={approveProduct}>
                    <input type="hidden" name="productId" value={p.id} />
                    <button
                      type="submit"
                      className={`min-h-11 rounded-full bg-[var(--btn-bg)] px-6 py-2.5 text-sm font-semibold text-[var(--btn-fg)] ${focus}`}
                    >
                      Approve
                    </button>
                  </form>
                  <form action={rejectProduct} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="productId" value={p.id} />
                    <label className="sr-only" htmlFor={`reason-${p.id}`}>Rejection reason</label>
                    <input
                      id={`reason-${p.id}`}
                      name="reason"
                      required
                      minLength={5}
                      placeholder="Reason (min 5 characters)"
                      className={`min-h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] ${focus}`}
                    />
                    <button
                      type="submit"
                      className={`min-h-11 rounded-full border border-[var(--border-strong)] px-6 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}
                    >
                      Reject
                    </button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}