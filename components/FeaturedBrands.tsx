"use client";

import { motion } from "motion/react";

type Brand = {
  name: string;
  handle: string; // Instagram username, no @
  tag: string;
  gradient: string;
};

// PLACEHOLDERS: replace with your real brands and Instagram handles
const brands: Brand[] = [
  {
    name: "RCW Clothing",
    handle: "your_handle_1",
    tag: "Streetwear",
    gradient: "from-violet-600 to-fuchsia-500",
  },
  {
    name: "Brand Two",
    handle: "your_handle_2",
    tag: "Digital",
    gradient: "from-fuchsia-500 to-orange-500",
  },
  {
    name: "Brand Three",
    handle: "your_handle_3",
    tag: "Lifestyle",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    name: "Brand Four",
    handle: "your_handle_4",
    tag: "Local favourite",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    name: "Brand Five",
    handle: "your_handle_5",
    tag: "Accessories",
    gradient: "from-orange-500 to-yellow-500",
  },
];

export default function FeaturedBrands() {
  return (
    <section aria-labelledby="brands-heading">
      <div className="mb-4 flex items-end justify-between">
        <h2
          id="brands-heading"
          className="text-xl font-bold text-[var(--text)]"
        >
          Featured Brands
        </h2>
        <span className="text-xs text-[var(--muted)]">Follow on Instagram</span>
      </div>

      <ul className="-mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        {brands.map((b, i) => (
          <motion.li
            key={b.handle}
            className="w-32 shrink-0 snap-start sm:w-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
          >
            <a
              href={`https://instagram.com/${b.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center transition-colors hover:border-[var(--border-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
            >
              <span
                className={`grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br ${b.gradient} p-[3px] transition-transform duration-300 group-hover:scale-110`}
              >
                <span className="grid h-full w-full place-items-center rounded-full bg-[var(--bg)] text-xl font-bold text-[var(--text)]">
                  {b.name[0]}
                </span>
              </span>
              <span className="text-sm font-semibold text-[var(--text)]">
                {b.name}
              </span>
              <span className="text-xs text-[var(--muted)]">@{b.handle}</span>
              <span className="rounded-full bg-[var(--hover)] px-2 py-0.5 text-[10px] text-[var(--muted)]">
                {b.tag}
              </span>
            </a>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
