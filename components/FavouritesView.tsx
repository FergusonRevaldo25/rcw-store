"use client";

import Link from "next/link";
import AnimatedCard from "@/components/AnimatedCard";
import ProductCard from "@/components/ProductCard";
import { useFavourites } from "@/components/FavouritesProvider";
import { products } from "@/lib/products";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function FavouritesView() {
  const { slugs, hydrated } = useFavourites();

  if (!hydrated) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading your favourites"
        className="h-48 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface)] motion-reduce:animate-none"
      />
    );
  }

  // Ignore saved slugs for products that no longer exist.
  const saved = products.filter((p) => slugs.includes(p.slug));

  if (saved.length === 0) {
    return (
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <h2 className="text-lg font-semibold text-[var(--text)]">
          No favourites yet
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Tap the heart on any product to save it here.
        </p>
        <Link
          href="/products/clothes"
          className={`mt-5 inline-flex min-h-10 items-center rounded-full bg-[var(--btn-bg)] px-5 py-2 text-sm font-semibold text-[var(--btn-fg)] ${focus}`}
        >
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <>
      <p aria-live="polite" className="mb-6 text-sm text-[var(--muted)]">
        {saved.length} saved {saved.length === 1 ? "product" : "products"}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {saved.map((p, i) => (
          <AnimatedCard key={p.slug} index={i}>
            <ProductCard product={p} />
          </AnimatedCard>
        ))}
      </div>
    </>
  );
}
