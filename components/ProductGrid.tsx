"use client";

import { useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function ProductGrid({ products }: { products: Product[] }) {
  const categories = ["all", ...new Set(products.map((p) => p.category))];
  const [active, setActive] = useState("all");

  const visible =
    active === "all" ? products : products.filter((p) => p.category === active);

  return (
    // Respects the "reduce motion" setting for everything inside
    <MotionConfig reducedMotion="user">
      <div
        role="group"
        aria-label="Filter products by category"
        className="mb-8 flex gap-6 border-b border-[var(--border)]"
      >
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            aria-pressed={active === c}
            className={`relative min-h-9 rounded px-1 pb-3 text-sm font-medium capitalize ${focus}`}
          >
            <span
              className={
                active === c ? "text-[var(--text)]" : "text-[var(--muted)]"
              }
            >
              {c.replace("-", " ")}
            </span>
            {active === c && (
              <motion.div
                layoutId="tab-underline"
                className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <AnimatePresence mode="popLayout">
          {visible.map((p, i) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -6 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 24,
                delay: Math.min(i, 8) * 0.05,
              }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </MotionConfig>
  );
}
