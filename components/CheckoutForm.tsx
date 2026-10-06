"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { placeOrder } from "@/app/checkout/actions";
import { useCart } from "@/components/CartProvider";
import { priceOrder } from "@/lib/checkout/pricing";
import type { PlaceOrderResult } from "@/lib/checkout/types";
import {
  EMPTY_FORM,
  PROVINCES,
  validateCheckoutForm,
  type CheckoutForm as Form,
  type FormErrors,
} from "@/lib/checkout/validation";
import { rand } from "@/lib/pos/money";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

const control = `w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-fuchsia-500/50 ${focus}`;

type TextField = {
  key: keyof Form;
  label: string;
  required: boolean;
  autoComplete: string;
  inputMode?: "tel" | "email" | "numeric";
  maxLength: number;
  wide?: boolean;
};

const FIELDS: TextField[] = [
  { key: "name", label: "Full name", required: true, autoComplete: "name", maxLength: 100, wide: true },
  { key: "email", label: "Email address", required: true, autoComplete: "email", inputMode: "email", maxLength: 254 },
  { key: "phone", label: "Phone number", required: true, autoComplete: "tel", inputMode: "tel", maxLength: 20 },
  { key: "address1", label: "Street address", required: true, autoComplete: "address-line1", maxLength: 120, wide: true },
  { key: "address2", label: "Apartment or complex", required: false, autoComplete: "address-line2", maxLength: 120, wide: true },
  { key: "suburb", label: "Suburb", required: true, autoComplete: "address-level3", maxLength: 80 },
  { key: "city", label: "City or town", required: true, autoComplete: "address-level2", maxLength: 80 },
];

function messageFor(
  res: Extract<PlaceOrderResult, { ok: false }>,
  nameOf: (slug?: string) => string
): string {
  switch (res.error) {
    case "disabled":
      return "Checkout is not available yet.";
    case "empty_cart":
      return "Your cart is empty.";
    case "no_such_product":
      return `${nameOf(res.slug)} is no longer available. Remove it from your cart and try again.`;
    case "digital_not_supported":
      return `${nameOf(res.slug)} is a digital product and cannot be bought online yet. Remove it from your cart to continue.`;
    case "out_of_stock":
      return `We do not have enough stock of ${nameOf(res.slug)}. Lower the quantity or remove it.`;
    case "bad_quantity":
      return "One of the quantities is not valid. Please check your cart.";
    case "bad_postal_code":
      return "Enter a valid 4-digit postal code.";
    case "invalid_form":
      return "Please fix the highlighted fields.";
    default:
      return "Something went wrong on our side. Please try again.";
  }
}

export default function CheckoutForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const { items, hydrated, clear } = useCart();
  const [values, setValues] = useState<Form>({
    ...EMPTY_FORM,
    name: defaultName,
    email: defaultEmail,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Display only. The server prices the order again from the database.
  const estimate = useMemo(() => {
    if (!/^\d{4}$/.test(values.postalCode.trim())) return null;
    const r = priceOrder({
      lines: items.map((i) => ({
        productId: i.slug,
        name: i.name,
        unitPriceCents: Math.round(i.price * 100),
        quantity: i.qty,
      })),
      postalCode: values.postalCode,
    });
    return r.ok ? r : null;
  }, [items, values.postalCode]);

  const subtotalCents = items.reduce(
    (sum, i) => sum + Math.round(i.price * 100) * i.qty,
    0
  );

  const nameOf = (slug?: string) =>
    items.find((i) => i.slug === slug)?.name ?? "An item in your cart";

  function set(key: keyof Form, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;

    const check = validateCheckoutForm(values);
    if (!check.ok) {
      setErrors(check.errors);
      setMessage("Please fix the highlighted fields.");
      const first = Object.keys(check.errors)[0];
      document.getElementById(`co-${first}`)?.focus();
      return;
    }
    setErrors({});
    setMessage("");
    setSending(true);

    try {
      const res = await placeOrder({
        lines: items.map((i) => ({ slug: i.slug, quantity: i.qty })),
        form: check.value,
      });
      if (res.ok) {
        clear();
        router.push(`/order/${res.token}`);
        return;
      }
      if (res.fieldErrors) setErrors(res.fieldErrors);
      setMessage(messageFor(res, nameOf));
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
    setSending(false);
  }

  if (!hydrated) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading checkout"
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
        <Link
          href="/products/clothes"
          className={`mt-5 inline-flex min-h-10 items-center rounded-full bg-[var(--btn-bg)] px-5 py-2 text-sm font-semibold text-[var(--btn-fg)] ${focus}`}
        >
          Continue shopping
        </Link>
      </section>
    );
  }

  const fieldError = (key: keyof Form) =>
    errors[key] ? (
      <p id={`co-${key}-err`} role="alert" className="mt-1 text-xs text-red-500">
        {errors[key]}
      </p>
    ) : null;

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid gap-8 lg:grid-cols-[1fr_340px]"
    >
      <section
        aria-label="Delivery details"
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
      >
        <h2 className="text-lg font-semibold text-[var(--text)]">
          Delivery details
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
              <label
                htmlFor={`co-${f.key}`}
                className="mb-1.5 block text-sm font-medium text-[var(--text)]"
              >
                {f.label}
                {f.required ? (
                  <span className="text-fuchsia-500"> *</span>
                ) : (
                  <span className="font-normal text-[var(--muted)]"> (optional)</span>
                )}
              </label>
              <input
                id={`co-${f.key}`}
                name={f.key}
                type="text"
                value={values[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                autoComplete={f.autoComplete}
                inputMode={f.inputMode}
                maxLength={f.maxLength}
                aria-invalid={!!errors[f.key]}
                aria-describedby={errors[f.key] ? `co-${f.key}-err` : undefined}
                className={control}
              />
              {fieldError(f.key)}
            </div>
          ))}

          <div>
            <label
              htmlFor="co-province"
              className="mb-1.5 block text-sm font-medium text-[var(--text)]"
            >
              Province<span className="text-fuchsia-500"> *</span>
            </label>
            <select
              id="co-province"
              name="province"
              value={values.province}
              onChange={(e) => set("province", e.target.value)}
              autoComplete="address-level1"
              aria-invalid={!!errors.province}
              aria-describedby={errors.province ? "co-province-err" : undefined}
              className={control}
            >
              <option value="">Choose one</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {fieldError("province")}
          </div>

          <div>
            <label
              htmlFor="co-postalCode"
              className="mb-1.5 block text-sm font-medium text-[var(--text)]"
            >
              Postal code<span className="text-fuchsia-500"> *</span>
            </label>
            <input
              id="co-postalCode"
              name="postalCode"
              type="text"
              value={values.postalCode}
              onChange={(e) => set("postalCode", e.target.value)}
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={4}
              aria-invalid={!!errors.postalCode}
              aria-describedby={errors.postalCode ? "co-postalCode-err" : undefined}
              className={control}
            />
            {fieldError("postalCode")}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="co-note"
              className="mb-1.5 block text-sm font-medium text-[var(--text)]"
            >
              Delivery note
              <span className="font-normal text-[var(--muted)]"> (optional)</span>
            </label>
            <textarea
              id="co-note"
              name="note"
              rows={3}
              value={values.note}
              onChange={(e) => set("note", e.target.value)}
              maxLength={500}
              className={control}
            />
            {fieldError("note")}
          </div>
        </div>
      </section>

      <aside
        aria-label="Order summary"
        className="h-fit rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:sticky lg:top-40"
      >
        <h2 className="text-lg font-semibold text-[var(--text)]">Your order</h2>

        <ul className="mt-4 divide-y divide-[var(--border)] text-sm">
          {items.map((i) => (
            <li key={i.slug} className="flex justify-between gap-3 py-2">
              <span className="text-[var(--text)]">
                {i.name}
                <span className="text-[var(--muted)]"> x {i.qty}</span>
              </span>
              <span className="shrink-0 text-[var(--text)]">
                {rand(Math.round(i.price * 100) * i.qty)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-[var(--border)] pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Subtotal</dt>
            <dd className="text-[var(--text)]">{rand(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Delivery</dt>
            <dd className="text-[var(--text)]">
              {estimate
                ? estimate.freeDelivery
                  ? "Free"
                  : rand(estimate.deliveryCents)
                : "Enter your postal code"}
            </dd>
          </div>
          {estimate && (
            <p className="text-xs text-[var(--muted)]">
              {estimate.deliveryArea}: {estimate.deliveryDays}
            </p>
          )}
        </dl>

        <div className="mt-4 flex justify-between border-t border-[var(--border)] pt-4">
          <span className="font-semibold text-[var(--text)]">Total</span>
          <span className="text-lg font-bold text-[var(--text)]">
            {estimate ? rand(estimate.totalCents) : rand(subtotalCents)}
          </span>
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">
          The final price is confirmed on your order page.
        </p>

        {message && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-[var(--text)]"
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className={`mt-5 min-h-11 w-full rounded-full bg-[var(--btn-bg)] px-6 py-2.5 text-sm font-semibold text-[var(--btn-fg)] disabled:opacity-60 ${focus}`}
        >
          {sending ? "Placing order..." : "Place order"}
        </button>
        <p className="mt-2 text-center text-xs text-[var(--muted)]">
          Online payment is not available yet. Your order is saved as awaiting
          payment.
        </p>
      </aside>
    </form>
  );
}
