"use client";

import { useActionState } from "react";
import type { ProductState } from "@/app/seller/products/actions";
import type { ProductValues } from "@/lib/validation/product";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const field =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-fuchsia-500/60 disabled:opacity-60";
const label = "mb-1.5 block text-sm font-medium text-[var(--text)]";

function Err({ id, msg }: { id: string; msg?: string }) {
  return (
    <p id={id} role="alert" className="mt-1 min-h-4 text-xs text-red-500">
      {msg}
    </p>
  );
}

export default function SellerProductForm({
  action,
  categories,
  initial,
  readOnly = false,
  submitLabel,
}: {
  action: (prev: ProductState, fd: FormData) => Promise<ProductState>;
  categories: { id: string; name: string }[];
  initial?: ProductValues;
  readOnly?: boolean;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ProductState, FormData>(
    action,
    {}
  );
  const e = state.errors ?? {};
  const v = state.values ?? initial;

  return (
    <form action={formAction} noValidate className="mt-6 space-y-3">
      <fieldset disabled={readOnly} className="space-y-3">
        <div>
          <label htmlFor="name" className={label}>Product name</label>
          <input id="name" name="name" defaultValue={v?.name} aria-invalid={!!e.name} aria-describedby="name-err" className={`${field} ${focus}`} />
          <Err id="name-err" msg={e.name} />
        </div>

        <div>
          <label htmlFor="description" className={label}>Description</label>
          <textarea id="description" name="description" rows={5} defaultValue={v?.description} aria-invalid={!!e.description} aria-describedby="description-err" className={`${field} ${focus}`} />
          <Err id="description-err" msg={e.description} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="priceRand" className={label}>Price (Rand)</label>
            <input id="priceRand" name="priceRand" inputMode="decimal" placeholder="249.99" defaultValue={v?.priceRand} aria-invalid={!!e.priceRand} aria-describedby="priceRand-err" className={`${field} ${focus}`} />
            <Err id="priceRand-err" msg={e.priceRand} />
          </div>
          <div>
            <label htmlFor="categoryId" className={label}>Category</label>
            <select id="categoryId" name="categoryId" defaultValue={v?.categoryId ?? ""} aria-invalid={!!e.categoryId} aria-describedby="categoryId-err" className={`${field} ${focus}`}>
              <option value="" disabled>Choose a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <Err id="categoryId-err" msg={e.categoryId} />
          </div>
        </div>

        <div>
          <label htmlFor="image" className={label}>Image path or https link</label>
          <input id="image" name="image" placeholder="/products/example.jpg" defaultValue={v?.image} aria-invalid={!!e.image} aria-describedby="image-err" className={`${field} ${focus}`} />
          <Err id="image-err" msg={e.image} />
          <p className="text-xs text-[var(--muted)]">File upload is coming. For now use a path or link.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="stock" className={label}>Stock on hand</label>
            <input id="stock" name="stock" inputMode="numeric" defaultValue={v?.stock ?? "0"} aria-invalid={!!e.stock} aria-describedby="stock-err" className={`${field} ${focus}`} />
            <Err id="stock-err" msg={e.stock} />
          </div>
          <div className="space-y-3 pt-7 text-sm text-[var(--text)]">
            <label className="flex items-center gap-3">
              <input type="checkbox" name="trackStock" defaultChecked={v?.trackStock ?? true} className={`h-5 w-5 ${focus}`} />
              Track stock for this product
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" name="isDigital" defaultChecked={v?.isDigital ?? false} className={`h-5 w-5 ${focus}`} />
              Digital download
            </label>
          </div>
        </div>
      </fieldset>

      <div role="status" className="min-h-5 text-sm">
        {state.error && <span className="text-red-500">{state.error}</span>}
        {state.saved && <span className="text-[var(--muted)]">Changes saved.</span>}
      </div>

      {!readOnly && (
        <button
          type="submit"
          disabled={pending}
          className={`min-h-12 w-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 ${focus}`}
        >
          {pending ? "Saving..." : submitLabel}
        </button>
      )}
    </form>
  );
}