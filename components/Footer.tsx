"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { SAFlag } from "@/components/Navbar";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

/* ---------- Content: edit these ---------- */

const columns = [
  {
    title: "Company Info",
    links: [
      { label: "About RCW", href: "/about" },
      { label: "Featured Brands", href: "/brands" },
      { label: "Great Deals SA", href: "/deals" },
      { label: "Careers", href: "/careers" },
      { label: "Sell on RCW", href: "/partner/sell-products" },
      { label: "Become a partner", href: "/partner" },
      { label: "Influencers", href: "/partner/influencer" },
    ],
  },
  {
    title: "Help & Support",
    links: [
      { label: "Shipping Info", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Refunds", href: "/refunds" },
      { label: "How To Order", href: "/how-to-order" },
      { label: "Track Order", href: "/track-order" },
      { label: "Size Guide", href: "/size-guide" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Payment Methods", href: "/payments" },
      { label: "Rewards", href: "/rewards" },
      { label: "FAQ", href: "/faq" },
    ],
  },
];

const ticker = [
  "Great deals",
  "Cheap prices",
  "Proudly South African",
  "Support local",
  "Shop the vibe",
];

// PLACEHOLDERS: put your real profile links here
const socials: { name: string; href: string; icon: ReactNode }[] = [
  {
    name: "Instagram",
    href: "https://instagram.com/your_handle",
    icon: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@your_handle",
    icon: <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />,
  },
  {
    name: "Facebook",
    href: "https://facebook.com/your_page",
    icon: (
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@your_channel",
    icon: (
      <>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <path d="M9.75 15.02 15.5 11.75 9.75 8.48z" />
      </>
    ),
  },
  {
    name: "X",
    href: "https://x.com/your_handle",
    icon: (
      <>
        <path d="M4 4l16 16" />
        <path d="M20 4L4 20" />
      </>
    ),
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/27000000000",
    icon: <path d="M3 21l1.65-4.2A9 9 0 1 1 8 19.5L3 21z" />,
  },
];

// PLACEHOLDERS: list only what you actually accept
const payments = ["VISA", "Mastercard", "PayFast", "Ozow", "SnapScan", "EFT"];

/* ---------- Small pieces ---------- */

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`group inline-flex w-fit items-center rounded py-1 text-sm text-zinc-400 transition-colors hover:text-white ${focus}`}
    >
      <span
        aria-hidden="true"
        className="w-0 -translate-x-2 overflow-hidden text-fuchsia-400 opacity-0 transition-all duration-200 group-hover:mr-1.5 group-hover:w-3 group-hover:translate-x-0 group-hover:opacity-100"
      >
        →
      </span>
      {children}
    </Link>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">
      {children}
    </h3>
  );
}

function Marquee() {
  const reduce = useReducedMotion();
  const items = [...ticker, ...ticker]; // doubled for a seamless loop

  return (
    <div
      className="overflow-hidden border-y border-white/10 bg-white/[0.03] py-3"
      aria-hidden="true"
    >
      <motion.div
        className="flex w-max whitespace-nowrap"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        {items.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-10 pr-10 text-sm font-bold uppercase tracking-widest text-zinc-300"
          >
            {t}
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------- Newsletter ---------- */

type Mode = "email" | "sms" | "whatsapp";

const modes: { id: Mode; label: string; placeholder: string; type: string }[] =
  [
    {
      id: "email",
      label: "Email",
      placeholder: "Your email address",
      type: "email",
    },
    { id: "sms", label: "SMS", placeholder: "082 000 0000", type: "tel" },
    {
      id: "whatsapp",
      label: "WhatsApp",
      placeholder: "082 000 0000",
      type: "tel",
    },
  ];

function Newsletter() {
  const [mode, setMode] = useState<Mode>("email");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const current = modes.find((m) => m.id === mode)!;

  function submit(e: FormEvent) {
    e.preventDefault();
    const v = value.trim();
    const ok =
      mode === "email"
        ? /^\S+@\S+\.\S+$/.test(v)
        : /^(0\d{9}|27\d{9}|\d{9})$/.test(v.replace(/\D/g, ""));
    if (!ok) {
      setError(
        mode === "email"
          ? "Enter a valid email address."
          : "Enter a valid South African number.",
      );
      return;
    }
    setError("");
    // TODO: send `mode` and `v` to your backend or email service here
    setDone(true);
  }

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5">
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-col items-center gap-2 py-6 text-center"
          >
            {Array.from({ length: 14 }).map((_, i) => {
              const a = (i / 14) * Math.PI * 2;
              return (
                <motion.span
                  key={i}
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
                  style={{
                    background: ["#7c3aed", "#d946ef", "#f97316", "#22c55e"][
                      i % 4
                    ],
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(a) * 80,
                    y: Math.sin(a) * 80,
                    opacity: 0,
                    scale: 0.4,
                  }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              );
            })}
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 12 }}
              className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-500"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </motion.span>
            <p className="text-lg font-bold text-white">You&apos;re in!</p>
            <p className="text-sm text-zinc-400">
              Watch your {current.label.toLowerCase()} for the next deals.
            </p>
            <button
              type="button"
              onClick={() => {
                setDone(false);
                setValue("");
              }}
              className={`mt-2 rounded px-2 py-1.5 text-xs text-zinc-400 underline hover:text-white ${focus}`}
            >
              Use another
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="mb-3 text-sm font-semibold text-white">
              Get the deals first
            </p>

            <div
              role="tablist"
              className="mb-3 flex gap-1 rounded-full bg-black/30 p-1"
            >
              {modes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={mode === m.id}
                  onClick={() => {
                    setMode(m.id);
                    setValue("");
                    setError("");
                  }}
                  className={`relative flex-1 rounded-full px-3 py-2 text-xs font-semibold ${focus} ${
                    mode === m.id
                      ? "text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {mode === m.id && (
                    <motion.span
                      layoutId="nl-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                  <span className="relative">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="flex min-w-0 flex-1 items-center rounded-full border border-white/10 bg-black/30 focus-within:border-fuchsia-500/50">
                {mode !== "email" && (
                  <span className="pl-4 text-sm text-zinc-400">+27</span>
                )}
                <input
                  type={current.type}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={current.placeholder}
                  aria-label={`${current.label} for deals`}
                  aria-invalid={!!error}
                  className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-zinc-400 focus:outline-none"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                className={`rounded-full bg-white px-5 text-sm font-bold text-black ${focus}`}
              >
                Subscribe
              </motion.button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                role="alert"
                className="mt-2 text-xs text-red-400"
              >
                {error}
              </motion.p>
            )}

            <p className="mt-3 text-xs leading-snug text-zinc-400">
              By subscribing you agree to receive marketing messages from RCW
              Store. Unsubscribe any time. See our{" "}
              <Link href="/privacy" className="underline hover:text-white">
                Privacy Policy
              </Link>
              .
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Back to top with scroll progress ring ---------- */

function BackToTop() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  const [show, setShow] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setShow(y > 500));

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.9 }}
          className={`fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full bg-[#100e17] text-white shadow-lg shadow-black/50 ${focus}`}
        >
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="rcw-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="50%" stopColor="#d946ef" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            <circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="2"
            />
            <motion.circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke="url(#rcw-ring)"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength: progress }}
            />
          </svg>
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
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ---------- Footer ---------- */

export default function Footer() {
  const reduce = useReducedMotion();

  return (
    <footer className="relative mt-20 overflow-hidden bg-[#07060b] text-white">
      {/* Flowing gradient strip */}
      <motion.div
        aria-hidden="true"
        className="h-1"
        style={{
          backgroundImage:
            "linear-gradient(90deg,#7c3aed,#d946ef,#f97316,#7c3aed)",
          backgroundSize: "200% 100%",
        }}
        animate={
          reduce ? undefined : { backgroundPosition: ["0% 0%", "200% 0%"] }
        }
        transition={{ duration: 6, ease: "linear", repeat: Infinity }}
      />

      {/* Drifting glow blobs */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl"
        animate={reduce ? undefined : { x: [0, 60, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl"
        animate={reduce ? undefined : { x: [0, -60, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <Marquee />

      <div className="relative mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6">
            {columns.map((col, ci) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: ci * 0.1 }}
              >
                <Heading>{col.title}</Heading>
                <ul className="flex flex-col gap-1.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <FooterLink href={l.href}>{l.label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Right side */}
          <div className="space-y-8 lg:col-span-6">
            <div>
              <Heading>Find us on</Heading>
              <ul className="flex flex-wrap gap-3">
                {socials.map((s, i) => (
                  <motion.li
                    key={s.name}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 18,
                      delay: i * 0.06,
                    }}
                  >
                    <motion.a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.name}
                      whileHover={{ scale: 1.15, rotate: -6, y: -4 }}
                      whileTap={{ scale: 0.9 }}
                      className={`grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 transition-colors hover:border-transparent hover:bg-gradient-to-br hover:from-violet-600 hover:via-fuchsia-500 hover:to-orange-500 hover:text-white ${focus}`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        {s.icon}
                      </svg>
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </div>

            <Newsletter />

            <div>
              <Heading>We accept</Heading>
              <ul className="flex flex-wrap gap-2">
                {payments.map((p) => (
                  <motion.li
                    key={p}
                    whileHover={{ y: -3, rotate: -2 }}
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold tracking-wide text-zinc-300"
                  >
                    {p}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Giant wordmark */}
        <motion.p
          aria-hidden="true"
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mt-14 cursor-default select-none whitespace-nowrap text-center text-[13vw] font-black leading-none tracking-tighter text-transparent transition-all duration-500 hover:bg-gradient-to-r hover:from-violet-600 hover:via-fuchsia-500 hover:to-orange-500 hover:bg-clip-text lg:text-[8.5rem]"
          style={{ WebkitTextStroke: "2px rgba(255,255,255,0.18)" }}
        >
          RCW STORE
        </motion.p>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-zinc-400 md:flex-row">
          <p>© {new Date().getFullYear()} RCW Store. All rights reserved.</p>

          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            <li>
              <Link
                href="/privacy"
                className="inline-block py-1.5 hover:text-white"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="inline-block py-1.5 hover:text-white"
              >
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link
                href="/cookies"
                className="inline-block py-1.5 hover:text-white"
              >
                Cookie Policy
              </Link>
            </li>
          </ul>

          <p className="flex items-center gap-2">
            Proudly made in South Africa
            <SAFlag className="h-3.5 w-5" />
          </p>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}
