import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductListing from "@/components/ProductListing";
import { getLiveSlugsForChrome } from "@/lib/catalogue/categories";
import { listProducts } from "@/lib/catalogue/storefront";
import { categoryMeta } from "@/lib/categoryMeta";

type Props = { params: Promise<{ category: string }> };

export const dynamic = "force-dynamic";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const meta = categoryMeta.find((c) => c.slug === category);
  if (!meta) return { title: "Category not found | RCW Store" };

  const live = new Set<string>(await getLiveSlugsForChrome());
  return {
    title: `${meta.name} | RCW Store`,
    description: live.has(meta.slug)
      ? `Shop ${meta.name} at RCW Store. Great deals and cheap prices, proudly South African.`
      : `${meta.name} is coming soon to RCW Store.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const meta = categoryMeta.find((c) => c.slug === category);
  if (!meta) notFound();

  // The database decides what is live, so the admin switch changes the site.
  const live = new Set<string>(await getLiveSlugsForChrome());
  const isLive = live.has(meta.slug);

  const items = isLive
    ? await listProducts({ categorySlug: meta.slug, limit: 100 })
    : [];
  const liveCategories = categoryMeta.filter((c) => live.has(c.slug));

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl p-6">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: meta.name }]}
        />

        <h1 className="mb-6 text-2xl font-bold text-[var(--text)] sm:text-3xl">
          {meta.name}
        </h1>

        {!isLive ? (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <h2 className="text-lg font-semibold text-[var(--text)]">
              Coming soon
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
              We are still stocking {meta.name}. Check back soon, or browse what
              is available now.
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
        ) : items.length === 0 ? (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <h2 className="text-lg font-semibold text-[var(--text)]">
              No products yet
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Products for {meta.name} are being added. Please check back soon.
            </p>
          </section>
        ) : (
          <ProductListing products={items} />
        )}
      </div>
    </main>
  );
}