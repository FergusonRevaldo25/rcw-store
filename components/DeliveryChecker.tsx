"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { freeOver, getQuote, type Quote } from "@/lib/delivery";

export default function DeliveryChecker() {
  const [code, setCode] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = getQuote(code);
    if (!q) {
      setQuote(null);
      setError("Enter a 4-digit South African postal code.");
      return;
    }
    setError("");
    setQuote(q);
  }

  return (
    <section
      aria-labelledby="delivery-heading"
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
    >
      <h2
        id="delivery-heading"
        className="text-xl font-bold text-[var(--text)]"
      >
        Check delivery to your area
      </h2>
      <p className="mb-4 mt-1 text-sm text-[var(--muted)]">
        See the estimated time and cost before you order. Free delivery over R
        {freeOver}.
      </p>

      <form onSubmit={submit} noValidate className="flex max-w-md gap-2">
        <label htmlFor="postcode" className="sr-only">
          Postal code
        </label>
        <input
          id="postcode"
          inputMode="numeric"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="Postal code, e.g. 2000"
          aria-invalid={!!error}
          className="min-w-0 flex-1 rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-fuchsia-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          className="rounded-full bg-[var(--btn-bg)] px-5 text-sm font-semibold text-[var(--btn-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
        >
          Check
        </motion.button>
      </form>

      <div aria-live="polite">
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-500">
            {error}
          </p>
        )}
        {quote && (
          <motion.dl
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 grid max-w-md grid-cols-3 gap-3 text-center"
          >
            {[
              ["Area", quote.area],
              ["Estimated time", quote.days],
              ["Delivery fee", `R${quote.fee}`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-[var(--hover)] px-2 py-3">
                <dt className="text-xs uppercase tracking-widest text-[var(--muted)]">
                  {k}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[var(--text)]">
                  {v}
                </dd>
              </div>
            ))}
          </motion.dl>
        )}
      </div>
    </section>
  );
}
