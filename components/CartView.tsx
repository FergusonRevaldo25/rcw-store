"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

const stepper =
  "grid h-9 w-9 place-items-center text-[var(--text)] transition-colors hover:bg-[var(--hover)] disabled:cursor-not-allowed disabled:text-[var(--dim)] disabled:hover:bg-transparent";

const MAX_QTY = 20;

export default function CartView() {
  const { items, count, subtotal, hydrated, setQty, removeItem, clear } =
    useCart();

  if (!hydrated) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading your cart"
        className="h-48 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface)] motion-reduce:animate-none"
      />
    );
  }

  if (items.length === 0) {
    return (
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <h2 className="text-lg font-semibold text-[var(--text)]">
          Your cart is empty
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Add something you like and it will show up here.
        </p>
        <Link
          href="/products/clothes"
          className={`mt-5 inline-flex min-h-10 items-center rounded-full bg-[var(--btn-bg)] px-5 py-2 text-sm font-semibold text-[var(--btn-fg)] ${focus}`}
        >
          Continue shopping
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <section aria-label="Cart items">
        <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {items.map((item) => {
            const href = `/products/${item.category}/${item.slug}`;
            const single = item.category === "digital-products";
            return (
              <li key={item.slug} className="flex gap-4 p-4">
                <Link
                  href={href}
                  aria-label={item.name}
                  className={`relative block h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] sm:h-24 sm:w-24 ${focus}`}
                >
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={href}
                        className={`rounded font-semibold text-[var(--text)] hover:underline ${focus}`}
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-sm text-[var(--muted)]">
                        R{item.price} each
                      </p>
                    </div>
                    <p className="shrink-0 font-bold text-[var(--text)]">
                      R{item.price * item.qty}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    {single ? (
                      <p className="text-sm text-[var(--muted)]">
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
                          onClick={() => setQty(item.slug, item.qty - 1)}
                          className={`${stepper} ${focus}`}
                        >
                          <svg
                            width="14"
                            height="14"
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
                          className="min-w-8 text-center text-sm font-semibold text-[var(--text)]"
                        >
                          {item.qty}
                        </output>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          disabled={item.qty >= MAX_QTY}
                          onClick={() => setQty(item.slug, item.qty + 1)}
                          className={`${stepper} ${focus}`}
                        >
                          <svg
                            width="14"
                            height="14"
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
                      className={`min-h-8 rounded px-2 text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={clear}
          className={`mt-4 min-h-8 rounded px-2 text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}
        >
          Clear cart
        </button>
      </section>

      <aside
        aria-label="Order summary"
        className="h-fit rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:sticky lg:top-40"
      >
        <h2 className="text-lg font-semibold text-[var(--text)]">
          Order summary
        </h2>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">
              Subtotal ({count} {count === 1 ? "item" : "items"})
            </dt>
            <dd className="font-medium text-[var(--text)]">R{subtotal}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Delivery</dt>
            <dd className="text-[var(--muted)]">Calculated at checkout</dd>
          </div>
        </dl>

        <div className="mt-4 flex justify-between border-t border-[var(--border)] pt-4">
          <span className="font-semibold text-[var(--text)]">Total</span>
          <span className="text-lg font-bold text-[var(--text)]">
            R{subtotal}
          </span>
        </div>

        {/* PLACEHOLDER: checkout is not built yet (step 5) */}
        <button
          type="button"
          disabled
          className="mt-5 min-h-11 w-full cursor-not-allowed rounded-full bg-[var(--btn-bg)] px-6 py-2.5 text-sm font-semibold text-[var(--btn-fg)] opacity-50"
        >
          Checkout
        </button>
        <p className="mt-2 text-center text-xs text-[var(--muted)]">
          Checkout is not available yet.
        </p>

        <Link
          href="/products/clothes"
          className={`mt-4 block rounded text-center text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
