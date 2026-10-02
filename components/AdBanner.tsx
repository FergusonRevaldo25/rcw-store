"use client";

import { motion } from "motion/react";
import { SAFlag } from "@/components/Navbar";

// Change this to your Great Deals SA Instagram page or a /deals page
const HREF = "https://instagram.com/your_greatdealssa_handle";

export default function AdBanner() {
  const external = HREF.startsWith("http");

  return (
    <motion.a
      href={HREF}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="relative block overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-emerald-700 via-teal-600 to-yellow-500 p-6 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:p-8"
    >
      <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/80 sm:justify-start">
            <SAFlag /> Proudly South African
          </p>
          <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
            Great Deals SA
          </h2>
          <p className="mt-1 max-w-md text-sm text-white/90">
            Daily specials, cheap prices and the best local finds. Follow for
            new deals every day.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black">
          Follow &amp; save →
        </span>
      </div>
      <span className="absolute right-3 top-2 text-[10px] uppercase tracking-wider text-white/60">
        Ad
      </span>
    </motion.a>
  );
}
