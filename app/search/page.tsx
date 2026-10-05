import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import { searchProducts } from "@/lib/catalogue/storefront";
import { categoryMeta } from "@/lib/categoryMeta";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

function readQuery(q: string | string[] | undefined) {
  const value = Array.isArray(q) ? q[0] : q;
  return (value ?? "").trim().slice(0, 100);
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const q = readQuery((await searchParams).q);
  return {
    title: q ? `Search: ${q} | RCW Store` : "Search | RCW Store",
    robots: { index: false },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const q = readQuery((await searchParams).q);
  const results = q ? await searchProducts(q) : [];
  const liveCategories = categoryMeta.filter((c) => c.live);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl p-6">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Search" }]}
        />

        <h1 className="mb-2 text-2xl font-bold text-[var(--text)] sm:text-3xl">
          {q ? `Results for "${q}"` : "Search"}
        </h1>

        {q && (
          <p aria-live="polite" className="mb-6 text-sm text-[var(--muted)]">
            {results.length} {results.length === 1 ? "product" : "products"}{" "}
            found
          </p>
        )}

        {!q ? (
          <p className="text-[var(--muted)]">
            Type something in the search bar above to find products.
          </p>
        ) : results.length === 0 ? (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <h2 className="text-lg font-semibold text-[var(--text)]">
              Nothing matched your search
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Check the spelling, try fewer words, or browse a category.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {liveCategories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/products/${c.slug}`}
                  className={`inline-flex min-h-10 items-center rounded-full bg-[var(--btn-bg)] px-5 py-2 text-sm font-semibold text-[var(--btn-fg)] ${focus}`}
                >
                  Shop {c.name}
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}