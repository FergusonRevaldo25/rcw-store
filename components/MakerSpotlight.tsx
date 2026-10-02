"use client";

import { motion } from "motion/react";

// PLACEHOLDER content. Replace with a real South African brand each week.
const maker = {
  name: "Your Featured Brand",
  location: "Johannesburg",
  handle: "your_featured_handle",
  story:
    "Write two or three sentences here about who they are, what they make and why you picked them.",
};

export default function MakerSpotlight() {
  return (
    <motion.section
      aria-labelledby="maker-heading"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className="grid overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] md:grid-cols-5"
    >
      <div className="grid min-h-40 place-items-center bg-gradient-to-br from-emerald-600 via-teal-600 to-yellow-500 text-6xl font-black text-white md:col-span-2">
        <span aria-hidden="true">{maker.name[0]}</span>
      </div>
      <div className="p-6 md:col-span-3 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          Maker of the week
        </p>
        <h2
          id="maker-heading"
          className="mt-1 text-2xl font-extrabold text-[var(--text)]"
        >
          {maker.name}
        </h2>
        <p className="text-sm text-[var(--muted)]">
          {maker.location}, South Africa
        </p>
        <p className="mt-3 max-w-prose text-sm text-[var(--text)]">
          {maker.story}
        </p>
        <a
          href={`https://instagram.com/${maker.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block rounded-full bg-[var(--btn-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--btn-fg)] transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
        >
          Follow @{maker.handle}
        </a>
      </div>
    </motion.section>
  );
}
