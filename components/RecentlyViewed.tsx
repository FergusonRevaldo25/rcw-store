"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { clearRecent, readRecent } from "@/lib/recent";
import { getProductBySlug } from "@/lib/products";
import type { Product } from "@/types/product";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function RecentlyViewed() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readRecent());
  }, []);

  const viewed = slugs
    .map((s) => getProductBySlug(s))
    .filter((p): p is Product => !!p);

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
            setSlugs([]);
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
