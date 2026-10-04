"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function TwoFactorStep({ onDone }: { onDone: () => void }) {
  const [backup, setBackup] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get("code") ?? "").trim();
    if (!code) return setError("Enter the code.");
    setError("");
    setBusy(true);
    const res = backup
      ? await authClient.twoFactor.verifyBackupCode({ code })
      : await authClient.twoFactor.verifyTotp({ code });
    setBusy(false);
    if (res.error) return setError(res.error.message ?? "That code did not work.");
    onDone();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[var(--text)]">Two-factor check</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {backup
          ? "Enter one of your saved backup codes."
          : "Enter the 6-digit code from your authenticator app."}
      </p>
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        <div>
          <label htmlFor="tf-code" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
            {backup ? "Backup code" : "Authentication code"}
          </label>
          <input
            id="tf-code"
            name="code"
            inputMode={backup ? "text" : "numeric"}
            autoComplete="one-time-code"
            className={`w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] focus:border-fuchsia-500/60 ${focus}`}
          />
        </div>
        <div role="alert" className="min-h-5 text-sm text-red-500">{error}</div>
        <button
          type="submit"
          disabled={busy}
          className={`min-h-12 w-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 px-6 py-3 text-sm font-bold text-white disabled:opacity-60 ${focus}`}
        >
          {busy ? "Checking..." : "Verify"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => { setBackup((b) => !b); setError(""); }}
        className={`mt-4 min-h-10 rounded px-2 text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}
      >
        {backup ? "Use my authenticator app" : "Use a backup code"}
      </button>
    </div>
  );
}