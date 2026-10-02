"use client";

import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { categoryMeta, showcaseSlugs } from "@/lib/categoryMeta";

const accents = [
  "from-violet-600 to-fuchsia-500",
  "from-fuchsia-500 to-orange-500",
  "from-indigo-500 to-violet-500",
  "from-emerald-500 to-teal-500",
  "from-pink-500 to-orange-400",
  "from-sky-500 to-indigo-500",
];

const showcase = showcaseSlugs
  .map((s) => categoryMeta.find((c) => c.slug === s))
  .filter((c): c is NonNullable<typeof c> => !!c);

const more = categoryMeta.filter((c) => !showcaseSlugs.includes(c.slug));

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

const tile =
  "flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm";

export default function CategoryShowcase() {
  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby="cats-heading">
        <h2
          id="cats-heading"
          className="mb-4 text-xl font-bold text-[var(--text)]"
        >
          Shop by Category
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {showcase.map((c, i) => {
            const href = `/products/${c.slug}`;
            return (
              <motion.article
                key={c.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                whileHover={c.live ? { y: -4 } : undefined}
                className={`flex h-full flex-col rounded-2xl border p-5 transition-colors ${
                  c.live
                    ? "border-[var(--border-strong)] bg-[var(--surface)] hover:border-fuchsia-500/50"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mb-4 h-1 w-12 rounded-full bg-gradient-to-r ${
                    accents[i % accents.length]
                  } ${c.live ? "" : "opacity-40"}`}
                />

                <header className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3
                      className={`font-semibold ${
                        c.live ? "text-[var(--text)]" : "text-[var(--muted)]"
                      }`}
                    >
                      {c.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      {c.live ? "Available now" : "Coming soon"}
                    </p>
                  </div>
                  {c.live && (
                    <Link
                      href={href}
                      aria-label={`View all ${c.name}`}
                      className={`inline-flex min-h-8 shrink-0 items-center rounded-full bg-[var(--btn-bg)] px-3.5 text-xs font-semibold text-[var(--btn-fg)] transition-transform hover:scale-105 ${focus}`}
                    >
                      View all
                    </Link>
                  )}
                </header>

                <ul className="grid flex-1 grid-cols-2 gap-2">
                  {c.items?.map((it) => (
                    <li key={it.name}>
                      {c.live ? (
                        <Link
                          href={href}
                          className={`${tile} h-full text-[var(--text)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--hover)] ${focus}`}
                        >
                          <span className="leading-tight">{it.name}</span>
                          <span
                            aria-hidden="true"
                            className="text-[var(--muted)]"
                          >
                            &rarr;
                          </span>
                        </Link>
                      ) : (
                        <div className={`${tile} h-full text-[var(--dim)]`}>
                          <span className="leading-tight">{it.name}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            More coming soon
          </p>
          <ul className="flex flex-wrap gap-2">
            {more.map((c) => (
              <li
                key={c.slug}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--muted)]"
              >
                {c.name}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </MotionConfig>
  );
}
