"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";

const tiers = [150, 300, 600];

export default function ShopByBudget({ products }: { products: Product[] }) {
  const [max, setMax] = useState<number | null>(null);
  const results = max ? products.filter((p) => p.price <= max) : [];

  return (
    <section aria-labelledby="budget-heading">
      <h2
        id="budget-heading"
        className="mb-4 text-xl font-bold text-[var(--text)]"
      >
        Shop by Budget
      </h2>

      <div className="grid gap-3 sm:grid-cols-3">
        {tiers.map((t) => {
          const n = products.filter((p) => p.price <= t).length;
          const on = max === t;
          return (
            <motion.button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() => setMax(on ? null : t)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className={`rounded-2xl border p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70 ${
                on
                  ? "border-transparent bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-500 text-white"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--border-strong)]"
              }`}
            >
              <span
                className={`block text-xs font-semibold uppercase tracking-widest ${on ? "text-white/80" : "text-[var(--muted)]"}`}
              >
                Under
              </span>
              <span className="block text-3xl font-extrabold">R{t}</span>
              <span
                className={`mt-1 block text-sm ${on ? "text-white/90" : "text-[var(--muted)]"}`}
              >
                {n} {n === 1 ? "item" : "items"}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div aria-live="polite">
        <AnimatePresence initial={false}>
          {max && (
            <motion.div
              key="results"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-5">
                {results.length ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {results.map((p) => (
                      <ProductCard key={p.slug} product={p} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted)]">
                    Nothing under R{max} yet. Check back soon.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}