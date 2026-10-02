"use client";

import { useId, useMemo, useState } from "react";
import AnimatedCard from "@/components/AnimatedCard";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function ProductListing({ products }: { products: Product[] }) {
  const selectId = useId();
  const [sort, setSort] = useState<SortKey>("featured");

  const sorted = useMemo(() => {
    const list = [...products];
    switch (sort) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [products, sort]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-[var(--muted)]">
          {sorted.length} {sorted.length === 1 ? "product" : "products"}
        </p>

        <div className="flex items-center gap-2">
          <label htmlFor={selectId} className="text-sm text-[var(--muted)]">
            Sort by
          </label>
          <select
            id={selectId}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className={`min-h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text)] ${focus}`}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {sorted.map((p, i) => (
          <AnimatedCard key={p.slug} index={i}>
            <ProductCard product={p} />
          </AnimatedCard>
        ))}
      </div>
    </>
  );
}
