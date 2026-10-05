"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { formatRand } from "@/lib/format";
import type { Product } from "@/types/product";

const HEX = "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)";

type Slot = {
  left: number; // % of banner width
  top: number; // % of banner height
  w: number; // hexagon width, % of banner width
  product?: number; // index into products (photo tile)
  label?: string; // text for non-photo tiles
  href?: string;
  gradient?: string;
};

// Tweak left/top/w to rearrange the collage.
const slots: Slot[] = [
  { left: 1, top: 6, w: 28, product: 0 },
  {
    left: 30,
    top: 2,
    w: 20,
    label: "New In",
    href: "/products/clothes",
    gradient: "from-violet-600 to-fuchsia-500",
  },
  {
    left: 52,
    top: 4,
    w: 14,
    label: "Deals",
    href: "/deals",
    gradient: "from-orange-500 to-pink-500",
  },
  { left: 70, top: 3, w: 28, product: 1 },
  { left: 48, top: 28, w: 18, product: 2 },
  {
    left: 24,
    top: 36,
    w: 24,
    label: "Digital",
    href: "/products/digital-products",
    gradient: "from-indigo-600 to-violet-500",
  },
  {
    left: 0,
    top: 52,
    w: 20,
    label: "Clothes",
    href: "/products/clothes",
    gradient: "from-fuchsia-600 to-orange-500",
  },
  { left: 52, top: 58, w: 20, product: 3 },
  {
    left: 74,
    top: 52,
    w: 24,
    label: "Shop All",
    href: "/products/clothes",
    gradient: "from-emerald-600 to-teal-500",
  },
];

export default function HexCollage({ products }: { products: Product[] }) {
  const reduce = useReducedMotion();

  return (
    <section aria-labelledby="collage-heading">
      <div className="mb-4 flex items-end justify-between">
        <h2
          id="collage-heading"
          className="text-xl font-bold text-[var(--text)]"
        >
          The Collection
        </h2>
        <Link
          href="/products/clothes"
          className="text-sm text-[var(--muted)] hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
        >
          View all
        </Link>
      </div>

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-violet-700 via-fuchsia-600 to-orange-500">
        {/* Soft background shapes */}
        <div className="absolute -left-10 top-1/3 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-black/20 blur-3xl" />

        {slots.map((s, i) => {
          const p = s.product !== undefined ? products[s.product] : undefined;
          const href = p ? `/products/${p.category}/${p.slug}` : s.href;
          // A photo tile with no product to show is skipped.
          if (!href || (s.product !== undefined && !p)) return null;
          const name = p?.name ?? s.label ?? "";

          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.w}%`,
                aspectRatio: "1 / 0.866",
                filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
              }}
              initial={reduce ? false : { opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 20,
                delay: i * 0.07,
              }}
              whileHover={reduce ? undefined : { scale: 1.07, zIndex: 10 }}
            >
              <Link
                href={href}
                aria-label={name}
                className="group block h-full w-full bg-white focus:outline-none focus-visible:bg-fuchsia-300"
                style={{ clipPath: HEX }}
              >
                {/* White border = gap between the outer and inner hexagon */}
                <div
                  className="absolute inset-[3%] overflow-hidden"
                  style={{ clipPath: HEX }}
                >
                  {p ? (
                    <>
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, 40vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-[10%] pt-6 text-center text-[8px] font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:text-xs">
                        {p.name}
                        <span className="block font-normal text-white/80">
                          {formatRand(p.price)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div
                      className={`grid h-full w-full place-items-center bg-gradient-to-br ${s.gradient} text-center`}
                    >
                      <span className="px-2 text-[9px] font-bold uppercase tracking-widest text-white sm:text-sm">
                        {s.label}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}