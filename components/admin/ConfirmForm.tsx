"use client";

import { useActionState } from "react";
import { confirmCode, type ConfirmState } from "@/app/admin/confirm/actions";

const focus = "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function ConfirmForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<ConfirmState, FormData>(confirmCode, {});
  return (
    <form action={action} className="mt-4 space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
          Authenticator code
        </label>
        <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
          className={`min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 text-sm tracking-[0.4em] text-[var(--text)] ${focus}`} />
      </div>
      <p role="alert" className="min-h-5 text-sm text-red-500">{state.error}</p>
      <button type="submit" disabled={pending}
        className={`min-h-12 w-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 px-6 text-sm font-bold text-white disabled:opacity-60 ${focus}`}>
        {pending ? "Checking..." : "Confirm"}
      </button>
    </form>
  );
}