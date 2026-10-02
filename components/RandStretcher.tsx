"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { products } from "@/lib/products";
import type { Product } from "@/types/product";

// Tries every combination, so it only looks at the first 16 products.
// When your catalogue grows, switch to a simpler greedy approach.
function stretch(budget: number, pool: Product[]) {
  const list = pool.slice(0, 16);
  let top: Product[] = [];
  let topSum = 0;
  for (let m = 1; m < 1 << list.length; m++) {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < list.length; i++) {
      if (m & (1 << i)) {
        sum += list[i].price;
        count++;
      }
    }
    if (sum > budget) continue;
    if (count > top.length || (count === top.length && sum > topSum)) {
      top = list.filter((_, i) => m & (1 << i));
      topSum = sum;
    }
  }
  return { items: top, total: topSum };
}

const filters = [
  { label: "All", value: "all" },
  { label: "Clothes", value: "clothes" },
  { label: "Digital", value: "digital-products" },
];
const presets = [300, 500, 1000];

const chip =
  "rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function RandStretcher() {
  const [raw, setRaw] = useState("500");
  const [cat, setCat] = useState("all");
  const budget = Math.max(0, Math.floor(Number(raw) || 0));

  const result = useMemo(() => {
    const pool =
      cat === "all" ? products : products.filter((p) => p.category === cat);
    return stretch(budget, pool);
  }, [budget, cat]);

  return (
    <section aria-labelledby="stretch-heading">
      <h2
        id="stretch-heading"
        className="mb-1 text-xl font-bold text-[var(--text)]"
      >
        Rand Stretcher
      </h2>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Tell us your budget and we will fit in as many items as we can.
      </p>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="budget"
            className="text-sm font-medium text-[var(--text)]"
          >
            My budget
          </label>
          <div className="flex items-center rounded-full border border-[var(--border)] bg-[var(--bg)] pl-4 focus-within:border-fuchsia-500/60">
            <span className="text-sm text-[var(--muted)]">R</span>
            <input
              id="budget"
              inputMode="numeric"
              value={raw}
              onChange={(e) =>
                setRaw(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-24 bg-transparent px-2 py-2.5 text-sm text-[var(--text)] focus:outline-none"
            />
          </div>
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setRaw(String(p))}
              className={`${chip} ${
                budget === p
                  ? "border-transparent bg-[var(--btn-bg)] text-[var(--btn-fg)]"
                  : "border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)]"
              }`}
            >
              R{p}
            </button>
          ))}
        </div>

        <div
          className="mt-3 flex flex-wrap gap-2"
          role="group"
          aria-label="Product type"
        >
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={cat === f.value}
              onClick={() => setCat(f.value)}
              className={`${chip} ${
                cat === f.value
                  ? "border-transparent bg-[var(--btn-bg)] text-[var(--btn-fg)]"
                  : "border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-5" aria-live="polite">
          {result.items.length ? (
            <>
              <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
                {result.items.map((p) => (
                  <motion.li
                    key={p.slug}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Link
                      href={`/products/${p.category}/${p.slug}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-[var(--text)] hover:bg-[var(--hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
                    >
                      <span>{p.name}</span>
                      <span className="font-semibold">R{p.price}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                {[
                  ["Items", String(result.items.length)],
                  ["Total", `R${result.total}`],
                  ["Left over", `R${budget - result.total}`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-[var(--hover)] py-3">
                    <dt className="text-xs uppercase tracking-widest text-[var(--muted)]">
                      {k}
                    </dt>
                    <dd className="text-lg font-extrabold text-[var(--text)]">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              {budget === 0
                ? "Enter an amount to see what fits."
                : `Nothing fits under R${budget} in this selection yet. Try a higher budget.`}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
