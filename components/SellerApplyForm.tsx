"use client";

import { useActionState } from "react";
import { applyAsSeller, type ApplyState } from "@/app/sell/actions";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const field =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-fuchsia-500/60";
const label = "mb-1.5 block text-sm font-medium text-[var(--text)]";

function Err({ id, msg }: { id: string; msg?: string }) {
  return (
    <p id={id} role="alert" className="mt-1 min-h-4 text-xs text-red-500">
      {msg}
    </p>
  );
}

export default function SellerApplyForm() {
  const [state, action, pending] = useActionState<ApplyState, FormData>(
    applyAsSeller,
    {}
  );
  const e = state.errors ?? {};
  const v = state.values;

  return (
    <form action={action} noValidate className="mt-6 space-y-3">
      <div>
        <label htmlFor="businessName" className={label}>
          Business name
        </label>
        <input
          id="businessName"
          name="businessName"
          defaultValue={v?.businessName}
          aria-invalid={!!e.businessName}
          aria-describedby="businessName-err"
          className={`${field} ${focus}`}
        />
        <Err id="businessName-err" msg={e.businessName} />
      </div>

      <div>
        <label htmlFor="contactPhone" className={label}>
          Contact number
        </label>
        <input
          id="contactPhone"
          name="contactPhone"
          type="tel"
          autoComplete="tel"
          defaultValue={v?.contactPhone}
          aria-invalid={!!e.contactPhone}
          aria-describedby="contactPhone-err"
          className={`${field} ${focus}`}
        />
        <Err id="contactPhone-err" msg={e.contactPhone} />
      </div>

      <div>
        <label htmlFor="category" className={label}>
          What do you sell?
        </label>
        <input
          id="category"
          name="category"
          placeholder="e.g. Streetwear, digital templates"
          defaultValue={v?.category}
          aria-invalid={!!e.category}
          aria-describedby="category-err"
          className={`${field} ${focus}`}
        />
        <Err id="category-err" msg={e.category} />
      </div>

      <div>
        <label htmlFor="description" className={label}>
          About your business
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={v?.description}
          aria-invalid={!!e.description}
          aria-describedby="description-err"
          className={`${field} ${focus}`}
        />
        <Err id="description-err" msg={e.description} />
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            name="terms"
            aria-describedby="terms-err"
            className={`mt-0.5 h-5 w-5 shrink-0 ${focus}`}
          />
          <span>
            I accept the seller terms and agree that RCW Store may process the
            details above to review my application.
          </span>
        </label>
        <Err id="terms-err" msg={e.terms} />
      </div>

      <div role="alert" className="min-h-5 text-sm text-red-500">
        {state.error}
      </div>

      <button
        type="submit"
        disabled={pending}
        className={`min-h-12 w-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 ${focus}`}
      >
        {pending ? "Submitting..." : "Submit application"}
      </button>
    </form>
  );
}