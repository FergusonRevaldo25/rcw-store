"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";

type Answers = Record<string, string | number>;

const steps = [
  {
    key: "want",
    q: "What are you after?",
    opts: [
      { label: "Clothing", value: "clothes" },
      { label: "Digital tools", value: "digital-products" },
      { label: "Surprise me", value: "any" },
    ],
  },
  {
    key: "budget",
    q: "What is your budget?",
    opts: [
      { label: "Under R200", value: 200 },
      { label: "Under R400", value: 400 },
      { label: "Any budget", value: 99999 },
    ],
  },
  {
    key: "who",
    q: "Who is it for?",
    opts: [
      { label: "Me", value: "me" },
      { label: "A gift", value: "gift" },
      { label: "My business", value: "business" },
    ],
  },
];

function pick(a: Answers, products: Product[]) {
  const budget = Number(a.budget ?? 99999);
  const score = (cat: string) =>
    (a.want !== "any" && cat === a.want ? 3 : 0) +
    (a.who === "business" && cat === "digital-products" ? 2 : 0) +
    (a.who === "gift" && cat === "clothes" ? 1 : 0);

  const pool = products.filter((p) => p.price <= budget);
  const base = pool.length
    ? pool
    : [...products].sort((x, y) => x.price - y.price).slice(0, 2);
  const list = [...base]
    .sort((x, y) => score(y.category) - score(x.category))
    .slice(0, 3);
  const exact =
    pool.length > 0 && (a.want === "any" || list[0]?.category === a.want);
  return { list, exact };
}

export default function VibeQuiz({ products }: { products: Product[] }) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({});
  const done = step >= steps.length;
  const result = done ? pick(a, products) : null;

  return (
    <section aria-labelledby="quiz-heading">
      <h2
        id="quiz-heading"
        className="mb-1 text-xl font-bold text-[var(--text)]"
      >
        Find Your Pick
      </h2>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Three quick questions and we will suggest where to start.
      </p>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-[var(--hover)]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500"
            animate={{
              width: `${(Math.min(step, steps.length) / steps.length) * 100}%`,
            }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {!done ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                  Question {step + 1} of {steps.length}
                </p>
                <h3 className="mb-4 mt-1 text-lg font-semibold text-[var(--text)]">
                  {steps[step].q}
                </h3>
                <div className="grid gap-2 sm:grid-cols-3">
                  {steps[step].opts.map((o) => (
                    <motion.button
                      key={o.label}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setA({ ...a, [steps[step].key]: o.value });
                        setStep(step + 1);
                      }}
                      className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm font-medium text-[var(--text)] transition-colors hover:border-fuchsia-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
                    >
                      {o.label}
                    </motion.button>
                  ))}
                </div>
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="mt-4 rounded px-2 py-2 text-sm text-[var(--muted)] underline hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
                  >
                    Back
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {result!.list.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">
                    We have no products to suggest yet. Please check back soon.
                  </p>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-[var(--text)]">
                      {result!.exact
                        ? "Your picks"
                        : "Closest matches for your budget"}
                    </h3>
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {result!.list.map((p) => (
                        <ProductCard key={p.slug} product={p} />
                      ))}
                    </div>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setStep(0);
                    setA({});
                  }}
                  className="mt-4 rounded px-2 py-2 text-sm text-[var(--muted)] underline hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
                >
                  Start again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}