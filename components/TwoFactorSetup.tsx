"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const field =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] focus:border-fuchsia-500/60";
const primary = `min-h-12 w-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 px-6 py-3 text-sm font-bold text-white disabled:opacity-60 ${focus}`;

export default function TwoFactorSetup() {
  const router = useRouter();
  const [uri, setUri] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function start(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    if (!password) return setError("Enter your password.");
    setError("");
    setBusy(true);
    const res = await authClient.twoFactor.enable({ password });
    setBusy(false);
    if (res.error || !res.data) return setError(res.error?.message ?? "Could not start setup.");
    setUri(res.data.totpURI);
    setCodes(res.data.backupCodes);
  }

  async function confirm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get("code") ?? "").trim();
    if (!code) return setError("Enter the 6-digit code.");
    setError("");
    setBusy(true);
    const res = await authClient.twoFactor.verifyTotp({ code });
    setBusy(false);
    if (res.error) return setError(res.error.message ?? "That code did not work.");
    router.push("/admin");
    router.refresh();
  }

  if (!uri) {
    return (
      <form onSubmit={start} noValidate className="mt-6 space-y-4">
        <div>
          <label htmlFor="tf-pass" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
            Confirm your password
          </label>
          <input id="tf-pass" name="password" type="password" autoComplete="current-password" className={`${field} ${focus}`} />
        </div>
        <div role="alert" className="min-h-5 text-sm text-red-500">{error}</div>
        <button type="submit" disabled={busy} className={primary}>
          {busy ? "Please wait..." : "Start setup"}
        </button>
      </form>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <p className="text-sm text-[var(--text)]">
          1. Scan this with an authenticator app (Google Authenticator, Microsoft Authenticator, Authy).
        </p>
        <div className="mt-3 inline-block rounded-xl bg-white p-3">
          <QRCodeSVG value={uri} size={176} />
        </div>
      </div>

      <div>
        <p className="text-sm text-[var(--text)]">
          2. Save these backup codes somewhere safe. They are shown once. Each works one time if you lose your phone.
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 font-mono text-sm text-[var(--text)]">
          {codes.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>

      <form onSubmit={confirm} noValidate className="space-y-4">
        <div>
          <label htmlFor="tf-verify" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
            3. Enter the 6-digit code from the app
          </label>
          <input id="tf-verify" name="code" inputMode="numeric" autoComplete="one-time-code" className={`${field} ${focus}`} />
        </div>
        <div role="alert" className="min-h-5 text-sm text-red-500">{error}</div>
        <button type="submit" disabled={busy} className={primary}>
          {busy ? "Checking..." : "Turn on two-factor"}
        </button>
      </form>
    </div>
  );
}