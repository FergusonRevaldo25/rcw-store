import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { requireApprovedSeller } from "@/lib/seller";

export const metadata: Metadata = { title: "My products | Seller" };

const labels = {
  draft: "Draft",
  pending_review: "Waiting for review",
  live: "Live",
  rejected: "Needs changes",
} as const;

export default async function SellerProductsPage() {
  const { seller } = await requireApprovedSeller();

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      priceCents: products.priceCents,
      status: products.status,
      category: categories.name,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.sellerId, seller.id))
    .orderBy(desc(products.updatedAt));

  return (
    <main className="min-h-[60vh]">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-[var(--text)]">My products</h1>
          <Link
            href="/seller/products/new"
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--btn-bg)] px-6 py-2.5 text-sm font-semibold text-[var(--btn-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
          >
            Add product
          </Link>
        </div>

        {rows.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--muted)]">
            You have no products yet. Add your first one.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {rows.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/seller/products/${p.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-[var(--hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
                >
                  <span>
                    <span className="block text-sm font-semibold text-[var(--text)]">{p.name}</span>
                    <span className="block text-xs text-[var(--muted)]">
                      {p.category}, R{(p.priceCents / 100).toFixed(2)}
                    </span>
                  </span>
                  <span className="rounded-full bg-[var(--hover)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
                    {labels[p.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}