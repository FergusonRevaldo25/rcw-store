"use client";

import { formatRand } from "@/lib/format";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useCart } from "@/components/CartProvider";
import { useFavourites } from "@/components/FavouritesProvider";
import type { Product } from "@/types/product";

const MAX_QTY = 20;

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function ProductActions({
  product,
  showQuantity = true,
}: {
  product: Product;
  showQuantity?: boolean;
}) {
  const { addItem } = useCart();
  const favourites = useFavourites();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const liked = favourites.hydrated && favourites.isFavourite(product.slug);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleAdd() {
    addItem(product, showQuantity ? qty : 1);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2200);
  }

  const stepper =
    "grid h-10 w-10 place-items-center text-[var(--text)] transition-colors hover:bg-[var(--hover)] disabled:cursor-not-allowed disabled:text-[var(--dim)] disabled:hover:bg-transparent";

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-4">
        {showQuantity && (
          <div className="flex items-center gap-4">
            <div
              role="group"
              aria-label="Quantity"
              className="inline-flex items-center overflow-hidden rounded-full border border-[var(--border)]"
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className={`${stepper} ${focus}`}
              >
                <svg
                  width="16"
                  height="16"
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
                className="min-w-10 text-center text-sm font-semibold text-[var(--text)]"
              >
                {qty}
              </output>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={qty >= MAX_QTY}
                onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
                className={`${stepper} ${focus}`}
              >
                <svg
                  width="16"
                  height="16"
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

            {qty > 1 && (
              <p className="text-sm text-[var(--muted)]">
                Total: {formatRand(product.price * qty)}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            type="button"
            onClick={handleAdd}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className={`min-h-11 flex-1 overflow-hidden rounded-full px-6 py-2.5 text-sm font-semibold transition-colors duration-300 sm:flex-none sm:min-w-48 ${focus} ${
              added
                ? "bg-green-600 text-white"
                : "bg-[var(--btn-bg)] text-[var(--btn-fg)]"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={added ? "added" : "add"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {added ? "Added to cart" : "Add to cart"}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <motion.button
            type="button"
            aria-pressed={liked}
            onClick={() => favourites.toggle(product.slug)}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--hover)] ${focus}`}
          >
            <motion.svg
              key={liked ? "on" : "off"}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 12 }}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={liked ? "#ef4444" : "none"}
              stroke={liked ? "#ef4444" : "currentColor"}
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.65-9.5 9-9.5 9z" />
            </motion.svg>
            {liked ? "Saved to favourites" : "Save to favourites"}
          </motion.button>
        </div>

        <div role="status" className="min-h-5 text-sm">
          {added && (
            <p className="text-[var(--muted)]">
              {product.name} was added to your cart.{" "}
              <Link
                href="/cart"
                className={`rounded font-medium text-[var(--text)] underline underline-offset-2 ${focus}`}
              >
                View cart
              </Link>
            </p>
          )}
        </div>
      </div>
    </MotionConfig>
  );
}

