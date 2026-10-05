"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createSale } from "@/app/admin/(panel)/pos/actions";
import { parseRand, rand } from "@/lib/pos/money";
import { MAX_QTY, METHOD_LABELS, POS_METHODS, type PosMethod } from "@/lib/pos/settings";

export type PosItem = {
  id: string;
  name: string;
  priceCents: number;
  stock: number | null; // null means stock is not tracked
  image: string | null;
  category: string;
};

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const field = `min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] ${focus}`;
const step = `grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)] disabled:opacity-40 ${focus}`;

export default function PosTerminal({ items }: { items: PosItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<{ item: PosItem; qty: number }[]>([]);
  const [method, setMethod] = useState<PosMethod>("cash");
  const [tendered, setTendered] = useState("");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items;
  }, [items, query]);

  const total = cart.reduce((n, l) => n + l.item.priceCents * l.qty, 0);
  const given = parseRand(tendered);
  const change = given !== null && given >= total ? given - total : null;
  const limit = (i: PosItem) => Math.min(MAX_QTY, i.stock ?? MAX_QTY);

  function add(item: PosItem) {
    setError("");
    setCart((c) => {
      const found = c.find((l) => l.item.id === item.id);
      if (found)
        return c.map((l) =>
          l.item.id === item.id ? { ...l, qty: Math.min(limit(item), l.qty + 1) } : l
        );
      return [...c, { item, qty: 1 }];
    });
  }
  function setQty(id: string, qty: number) {
    setCart((c) =>
      qty <= 0
        ? c.filter((l) => l.item.id !== id)
        : c.map((l) => (l.item.id === id ? { ...l, qty: Math.min(limit(l.item), qty) } : l))
    );
  }

  async function charge() {
    setError("");
    if (cart.length === 0) return setError("The cart is empty.");
    if (method === "cash" && (given === null || given < total))
      return setError("Enter the cash received. It must cover the total.");
    if (method !== "cash" && reference.trim().length < 3)
      return setError("Enter the card slip or EFT reference.");

    setBusy(true);
    const res = await createSale({
      items: cart.map((l) => ({ productId: l.item.id, qty: l.qty })),
      method,
      tendered,
      reference,
    });
    if (!res.ok) {
      setBusy(false);
      setError(res.error);
      return;
    }
    router.push(`/admin/pos/receipt/${res.orderId}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section aria-label="Products">
        <label htmlFor="pos-search" className="sr-only">Search products</label>
        <input
          id="pos-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className={field}
        />
        {shown.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">No products match.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {shown.map((i) => {
              const out = i.stock !== null && i.stock <= 0;
              return (
                <li key={i.id}>
                  <button
                    type="button"
                    onClick={() => add(i)}
                    disabled={out}
                    className={`flex h-full w-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] text-left transition-colors hover:border-[var(--border-strong)] disabled:cursor-not-allowed disabled:opacity-50 ${focus}`}
                  >
                    {i.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.image} alt="" className="aspect-square w-full object-cover" />
                    )}
                    <span className="p-3">
                      <span className="block text-sm font-semibold text-[var(--text)]">{i.name}</span>
                      <span className="block text-sm text-[var(--text)]">{rand(i.priceCents)}</span>
                      <span className="block text-xs text-[var(--muted)]">
                        {out ? "Out of stock" : i.stock === null ? i.category : `${i.stock} in stock`}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-label="Current sale" className="h-fit rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:sticky lg:top-24">
        <h2 className="font-semibold text-[var(--text)]">Current sale</h2>

        {cart.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">Tap a product to add it.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {cart.map((l) => (
              <li key={l.item.id} className="flex items-center justify-between gap-2 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-[var(--text)]">{l.item.name}</span>
                  <span className="block text-xs text-[var(--muted)]">{rand(l.item.priceCents)} each</span>
                </span>
                <span className="flex items-center gap-1">
                  <button type="button" aria-label={`Decrease ${l.item.name}`} onClick={() => setQty(l.item.id, l.qty - 1)} className={step}>-</button>
                  <output aria-live="polite" className="min-w-6 text-center text-sm font-semibold text-[var(--text)]">{l.qty}</output>
                  <button type="button" aria-label={`Increase ${l.item.name}`} disabled={l.qty >= limit(l.item)} onClick={() => setQty(l.item.id, l.qty + 1)} className={step}>+</button>
                </span>
                <span className="w-20 text-right text-sm font-semibold text-[var(--text)]">
                  {rand(l.item.priceCents * l.qty)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
          <span className="text-sm text-[var(--muted)]">Total</span>
          <span className="text-2xl font-extrabold text-[var(--text)]">{rand(total)}</span>
        </div>

        <fieldset className="mt-4">
          <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">Payment</legend>
          <div className="grid grid-cols-3 gap-2">
            {POS_METHODS.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={method === m}
                onClick={() => { setMethod(m); setError(""); }}
                className={`min-h-11 rounded-lg border px-2 text-sm font-semibold ${focus} ${
                  method === m
                    ? "border-transparent bg-[var(--btn-bg)] text-[var(--btn-fg)]"
                    : "border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)]"
                }`}
              >
                {m === "cash" ? "Cash" : m === "card" ? "Card" : "EFT"}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">{METHOD_LABELS[method]}</p>
        </fieldset>

        {method === "cash" ? (
          <div className="mt-3">
            <label htmlFor="tendered" className="mb-1.5 block text-sm font-medium text-[var(--text)]">Cash received (Rand)</label>
            <div className="flex gap-2">
              <input id="tendered" inputMode="decimal" value={tendered} onChange={(e) => setTendered(e.target.value)} className={field} />
              <button type="button" onClick={() => setTendered((total / 100).toFixed(2))} className={`min-h-11 shrink-0 rounded-xl border border-[var(--border-strong)] px-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}>
                Exact
              </button>
            </div>
            <p role="status" className="mt-2 text-sm text-[var(--text)]">
              {change !== null ? `Change: ${rand(change)}` : ""}
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <label htmlFor="ref" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
              {method === "card" ? "Card slip reference" : "EFT reference"}
            </label>
            <input id="ref" value={reference} onChange={(e) => setReference(e.target.value)} className={field} />
          </div>
        )}

        <div role="alert" className="mt-2 min-h-5 text-sm text-red-500">{error}</div>

        <button
          type="button"
          onClick={charge}
          disabled={busy || cart.length === 0}
          className={`mt-2 min-h-12 w-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 px-6 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 ${focus}`}
        >
          {busy ? "Processing..." : `Charge ${rand(total)}`}
        </button>
        {cart.length > 0 && (
          <button type="button" onClick={() => { setCart([]); setError(""); }} className={`mt-2 min-h-10 w-full rounded-full text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}>
            Clear sale
          </button>
        )}
      </section>
    </div>
  );
}