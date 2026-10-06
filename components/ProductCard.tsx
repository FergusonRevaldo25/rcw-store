"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import PayInParts from "@/components/PayInParts";
import { useCart } from "@/components/CartProvider";
import { useFavourites } from "@/components/FavouritesProvider";
import { formatRand } from "@/lib/format";
import type { Product } from "@/types/product";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const favourites = useFavourites();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const liked = favourites.hydrated && favourites.isFavourite(product.slug);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleAdd() {
    addItem(product);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  }

  const href = `/products/${product.category}/${product.slug}`;

  return (
    <MotionConfig reducedMotion="user">
      <article className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-300 hover:border-[var(--border-strong)] hover:shadow-xl hover:shadow-black/20">
        <Link
          href={href}
          aria-label={product.name}
          className={`block ${focus}`}
        >
          <div className="relative aspect-square overflow-hidden bg-[var(--surface)]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 640px) 25vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          </div>
        </Link>

        <motion.button
          type="button"
          aria-label={
            liked
              ? `Remove ${product.name} from favourites`
              : `Add ${product.name} to favourites`
          }
          aria-pressed={liked}
          onClick={() => favourites.toggle(product.slug)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.8 }}
          className={`absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-black/50 backdrop-blur ${focus}`}
        >
          <motion.svg
            key={liked ? "on" : "off"}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 12 }}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={liked ? "#ef4444" : "none"}
            stroke={liked ? "#ef4444" : "#e5e5e5"}
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.65-9.5 9-9.5 9z" />
          </motion.svg>
        </motion.button>

        <div className="p-3 sm:p-4">
          <Link href={href} className={`rounded ${focus}`}>
            <h3 className="font-semibold text-[var(--text)]">{product.name}</h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)] sm:text-sm">
            {product.description}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <div>
              <p className="font-bold text-[var(--text)]">{formatRand(product.price)}</p>
              <PayInParts price={product.price} />
            </div>

            <motion.button
              type="button"
              onClick={handleAdd}
              disabled={added}
              aria-label={`Add ${product.name} to cart`}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              className={`min-h-9 min-w-[78px] overflow-hidden rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300 ${focus} ${
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
                  aria-hidden="true"
                >
                  {added ? "Added" : "Add"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>

          <span role="status" className="sr-only">
            {added ? `${product.name} added to cart` : ""}
          </span>
        </div>
      </article>
    </MotionConfig>
  );
}

