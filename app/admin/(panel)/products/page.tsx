import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, desc, eq } from "drizzle-orm";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { categoryScope, getVisibleCategoryIds } from "@/lib/catalogue/queries";
import { db } from "@/lib/db";
import { categories, productImages, products, sellers } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac/guard";
import { approveProduct, rejectProduct } from "./actions";

export const metadata: Metadata = { title: "Products | RCW Staff" };

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

const TABS = [
  { key: "pending_review", label: "Waiting for review" },
  { key: "draft", label: "Drafts" },
  { key: "live", label: "Live" },
  { key: "rejected", label: "Rejected" },
] as const;

const TONE = {
  pending_review: "warn",
  draft: "neutral",
  live: "good",
  rejected: "bad",
} as const;

const NOTICES: Record<string, string> = {
  own: "You cannot review a product you created yourself. Another staff member must do it.",
  scope: "That product is outside the categories you have access to, or you cannot change it.",
  missing: "That product is no longer in that state, or the reason was too short.",
  notsuper: "Only a Super Admin can publish their own product.",
  denied: "You do not have permission to do that.",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; notice?: string }>;
}) {
  const staff = await requirePermission("products:view");
  const { status, notice } = await searchParams;
  const canReview = staff.permissions.has("products:edit");
  const canCreate = staff.permissions.has("products:create");
  const visible = await getVisibleCategoryIds(staff.user.id);

  const active =
    TABS.find((t) => t.key === status)?.key ??
    (canReview ? "pending_review" : "draft");

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      priceCents: products.priceCents,
      stock: products.stock,
      trackStock: products.trackStock,
      isDigital: products.isDigital,
      status: products.status,
      createdBy: products.createdBy,
      sellerId: products.sellerId,
      rejectionReason: products.rejectionReason,
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
    .where(and(eq(products.status, active), categoryScope(products.categoryId, visible)))
    .orderBy(active === "pending_review" ? asc(products.submittedAt) : desc(products.updatedAt))
    .limit(100);

  return (
    <main>
      <PageHeader
        title="Products"
        description="Add products, send them for review, and manage what is live."
        actions={
          canCreate ? (
            <Link
              href="/admin/products/new"
              className={`inline-flex min-h-11 items-center rounded-full bg-[var(--btn-bg)] px-6 py-2.5 text-sm font-semibold text-[var(--btn-fg)] ${focus}`}
            >
              New product
            </Link>
          ) : undefined
        }
      />

      {notice && NOTICES[notice] && (
        <p role="alert" className="mb-4 rounded-lg border border-red-500/40 p-3 text-sm text-red-500">
          {NOTICES[notice]}
        </p>
      )}

      <nav aria-label="Product status" className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/products?status=${t.key}`}
            aria-current={t.key === active ? "page" : undefined}
            className={`inline-flex min-h-10 items-center rounded-lg border px-3 text-sm ${focus} ${
              t.key === active
                ? "border-[var(--border-strong)] bg-[var(--hover)] font-medium text-[var(--text)]"
                : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
          Nothing here.
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((p) => {
            const mine = p.createdBy === staff.user.id;
            const canOpen = p.sellerId === null || canReview;
            return (
              <li key={p.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex gap-4">
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt=""
                      className="h-24 w-24 shrink-0 rounded-lg border border-[var(--border)] object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="font-semibold text-[var(--text)]">{p.name}</h2>
                      <div className="flex items-center gap-2">
                        <StatusBadge label={TABS.find((t) => t.key === p.status)?.label ?? p.status} tone={TONE[p.status]} />
                        <span className="text-sm font-bold text-[var(--text)]">
                          R{(p.priceCents / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--muted)]">
                      {p.category}, {p.seller ? `seller: ${p.seller}` : "RCW product"},{" "}
                      {p.isDigital ? "digital" : p.trackStock ? `${p.stock} in stock` : "stock not tracked"}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{p.description}</p>
                    {p.status === "rejected" && p.rejectionReason && (
                      <p className="mt-2 text-sm text-red-500">Rejected: {p.rejectionReason}</p>
                    )}
                    {canOpen && (
                      <Link
                        href={`/admin/products/${p.id}`}
                        className={`mt-2 inline-block rounded text-sm text-[var(--text)] underline underline-offset-2 ${focus}`}
                      >
                        {p.sellerId === null && (mine || canReview) ? "Open and edit" : "Open"}
                      </Link>
                    )}
                  </div>
                </div>

                {p.status === "pending_review" && canReview && !mine && (
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

                {p.status === "pending_review" && mine && (
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    You created this, so another staff member must approve it.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}