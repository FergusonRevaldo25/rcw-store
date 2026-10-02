"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

type Slide = {
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  bg: string;
};

// Edit these to change what the carousel says
const slides: Slide[] = [
  {
    eyebrow: "Welcome to",
    title: "RCW Store",
    text: "Clothes, digital products, and more, all under one roof.",
    cta: "Start shopping",
    href: "/products/clothes",
    bg: "from-violet-700 via-fuchsia-600 to-orange-500",
  },
  {
    eyebrow: "New in clothes",
    title: "Wear the brand",
    text: "Hoodies and tees with the RCW logo. Premium fit, local prices.",
    cta: "Shop clothes",
    href: "/products/clothes",
    bg: "from-fuchsia-700 via-pink-600 to-orange-400",
  },
  {
    eyebrow: "Instant download",
    title: "Digital products",
    text: "Invoice templates and social media kits for your business.",
    cta: "Shop digital",
    href: "/products/digital-products",
    bg: "from-indigo-700 via-violet-600 to-fuchsia-500",
  },
  {
    eyebrow: "Proudly South African",
    title: "Great deals. Cheap prices.",
    text: "Support local and save on every order.",
    cta: "See deals",
    href: "/deals",
    bg: "from-emerald-700 via-teal-600 to-yellow-500",
  },
];

const INTERVAL = 5000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (d: number) => setIndex((i) => (i + d + slides.length) % slides.length),
    [],
  );

  useEffect(() => {
    if (paused || reduce) return;
    const t = setInterval(() => go(1), INTERVAL);
    return () => clearInterval(t);
  }, [paused, reduce, go, index]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      className="relative overflow-hidden rounded-2xl border border-white/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="relative h-64 sm:h-80 md:h-96">
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <motion.div
              key={s.title}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
              aria-hidden={!active}
              initial={false}
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.7, ease: "easeInOut" }}
              className={`absolute inset-0 bg-gradient-to-br ${s.bg} ${
                active ? "z-10" : "pointer-events-none z-0"
              }`}
            >
              <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-black/20 blur-2xl" />

              <motion.div
                initial={false}
                animate={{ y: active ? 0 : 16, opacity: active ? 1 : 0 }}
                transition={{
                  duration: reduce ? 0 : 0.6,
                  delay: active ? 0.15 : 0,
                }}
                className="relative flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white sm:px-16"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-white/80 sm:text-sm">
                  {s.eyebrow}
                </p>
                <h2 className="text-3xl font-extrabold drop-shadow sm:text-5xl">
                  {s.title}
                </h2>
                <p className="max-w-md text-sm text-white/90 sm:text-base">
                  {s.text}
                </p>
                <Link
                  href={s.href}
                  tabIndex={active ? 0 : -1}
                  className="mt-2 inline-flex min-h-10 items-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  {s.cta} <span aria-hidden="true">&nbsp;&rarr;</span>
                </Link>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Arrows (desktop) */}
      {(["prev", "next"] as const).map((dir) => (
        <button
          key={dir}
          type="button"
          onClick={() => go(dir === "next" ? 1 : -1)}
          aria-label={dir === "next" ? "Next slide" : "Previous slide"}
          className={`absolute top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:grid ${
            dir === "next" ? "right-3" : "left-3"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={dir === "next" ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
          </svg>
        </button>
      ))}

      {/* Dots: small dot inside a 24px-minimum tap area */}
      <div className="absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2">
        {slides.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className="grid h-6 place-items-center px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <span
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
