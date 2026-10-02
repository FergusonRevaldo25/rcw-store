"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useCart } from "@/components/CartProvider";

const MAX_QTY = 20;

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

const stepper =
  "grid h-8 w-8 place-items-center text-[var(--text)] transition-colors hover:bg-[var(--hover)] disabled:cursor-not-allowed disabled:text-[var(--dim)] disabled:hover:bg-transparent";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function CartDrawer() {
  const {
    items,
    count,
    subtotal,
    drawerOpen,
    closeDrawer,
    setQty,
    removeItem,
  } = useCart();
  const pathname = usePathname();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close whenever the route changes.
  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  // While open: lock page scroll, move focus in, trap Tab, close on Escape.
  useEffect(() => {
    if (!drawerOpen) return;

    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeDrawer();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const nodes = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      const inside = panelRef.current.contains(active);

      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previous?.focus?.();
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="overlay"
            aria-hidden="true"
            onClick={closeDrawer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-black/60"
          />
        )}
        {drawerOpen && (
          <motion.aside
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--menu)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <h2
                id="cart-drawer-title"
                className="text-lg font-semibold text-[var(--text)]"
              >
                Your cart
                {count > 0 && (
                  <span className="ml-2 text-sm font-normal text-[var(--muted)]">
                    ({count})
                  </span>
                )}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={closeDrawer}
                aria-label="Close cart"
                className={`grid h-10 w-10 place-items-center rounded-full text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-semibold text-[var(--text)]">
                    Your cart is empty
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Add something you like and it will show up here.
                  </p>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className={`mt-5 inline-flex min-h-10 items-center rounded-full bg-[var(--btn-bg)] px-5 py-2 text-sm font-semibold text-[var(--btn-fg)] ${focus}`}
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {items.map((item) => {
                    const href = `/products/${item.category}/${item.slug}`;
                    const single = item.category === "digital-products";
                    return (
                      <li key={item.slug} className="flex gap-3 py-4">
                        <Link
                          href={href}
                          onClick={closeDrawer}
                          aria-label={item.name}
                          className={`relative block h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] ${focus}`}
                        >
                          <Image
                            src={item.image}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={href}
                              onClick={closeDrawer}
                              className={`rounded text-sm font-semibold text-[var(--text)] hover:underline ${focus}`}
                            >
                              {item.name}
                            </Link>
                            <p className="shrink-0 text-sm font-bold text-[var(--text)]">
                              R{item.price * item.qty}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            {single ? (
                              <p className="text-xs text-[var(--muted)]">
                                Digital download
                              </p>
                            ) : (
                              <div
                                role="group"
                                aria-label={`Quantity for ${item.name}`}
                                className="inline-flex items-center overflow-hidden rounded-full border border-[var(--border)]"
                              >
                                <button
                                  type="button"
                                  aria-label={`Decrease quantity of ${item.name}`}
                                  disabled={item.qty <= 1}
                                  onClick={() =>
                                    setQty(item.slug, item.qty - 1)
                                  }
                                  className={`${stepper} ${focus}`}
                                >
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    aria-hidden="true"
                                  >
                                    <path d="M5 12h14" />
                                  </svg>
                                </button>
                                <output
                                  aria-live="polite"
                                  className="min-w-7 text-center text-sm font-semibold text-[var(--text)]"
                                >
                                  {item.qty}
                                </output>
                                <button
                                  type="button"
                                  aria-label={`Increase quantity of ${item.name}`}
                                  disabled={item.qty >= MAX_QTY}
                                  onClick={() =>
                                    setQty(item.slug, item.qty + 1)
                                  }
                                  className={`${stepper} ${focus}`}
                                >
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    aria-hidden="true"
                                  >
                                    <path d="M12 5v14M5 12h14" />
                                  </svg>
                                </button>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => removeItem(item.slug)}
                              aria-label={`Remove ${item.name} from cart`}
                              className={`min-h-8 rounded px-2 text-xs text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[var(--border)] px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--muted)]">Subtotal</span>
                  <span className="text-lg font-bold text-[var(--text)]">
                    R{subtotal}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Delivery is calculated at checkout.
                </p>

                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className={`mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--border-strong)] px-6 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}
                >
                  View cart
                </Link>

                {/* PLACEHOLDER: checkout is not built yet (step 5) */}
                <button
                  type="button"
                  disabled
                  className="mt-2 min-h-11 w-full cursor-not-allowed rounded-full bg-[var(--btn-bg)] px-6 py-2.5 text-sm font-semibold text-[var(--btn-fg)] opacity-50"
                >
                  Checkout
                </button>
                <p className="mt-2 text-center text-xs text-[var(--muted)]">
                  Checkout is not available yet.
                </p>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
