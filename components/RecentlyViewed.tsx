"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { fetchProductsBySlugs } from "@/lib/catalogue/storefront-actions";
import type { StoreProduct } from "@/lib/catalogue/storefront";
import { clearRecent, readRecent } from "@/lib/recent";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function RecentlyViewed() {
  const [viewed, setViewed] = useState<StoreProduct[]>([]);

  useEffect(() => {
    let cancelled = false;
    const slugs = readRecent();
    if (slugs.length === 0) return;

    fetchProductsBySlugs(slugs)
      .then((list) => {
        if (!cancelled) setViewed(list);
      })
      .catch(() => {
        // Recently viewed is a nice extra. If it fails, show nothing.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (viewed.length === 0) return null;

  return (
    <section aria-labelledby="recent-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2
          id="recent-heading"
          className="text-xl font-bold text-[var(--text)]"
        >
          Recently viewed
        </h2>
        <button
          type="button"
          onClick={() => {
            clearRecent();
            setViewed([]);
          }}
          className={`min-h-8 rounded px-2 text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}
        >
          Clear
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {viewed.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}