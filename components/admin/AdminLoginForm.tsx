"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const field = `min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--muted)] ${focus}`;
const label = "mb-1.5 block text-sm font-medium text-[var(--text)]";

type StaffUser = {
  kind?: string;
  status?: string;
  twoFactorEnabled?: boolean | null;
};

export default function AdminLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"password" | "code">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [trust, setTrust] = useState(true);

  // Runs once a session exists. Customers are signed straight back out.
  async function finish() {
    const s = await authClient.getSession();
    const u = s.data?.user as (StaffUser & Record<string, unknown>) | undefined;
    if (!u || u.kind !== "staff" || u.status === "suspended") {
      await authClient.signOut();
      setStep("password");
      setPassword("");
      setCode("");
      setError(
        "This sign-in is for RCW staff only. If you are staff and cannot get in, ask an admin."
      );
      return;
    }
    router.replace(u.twoFactorEnabled ? "/admin" : "/admin/two-factor");
    router.refresh();
  }

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      const res = await authClient.signIn.email({ email: email.trim(), password });
      if (res.error) {
        setError("That email and password do not match.");
        return;
      }
      const data = res.data as { twoFactorRedirect?: boolean } | null;
      if (data?.twoFactorRedirect) {
        setStep("code");
        return;
      }
      await finish();
    } catch {
      setError("We could not sign you in. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onCode(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setBusy(true);
    try {
      const res = await authClient.twoFactor.verifyTotp({ code: code.trim(), trustDevice: trust });
      if (res.error) {
        setError("That code is not right. Wait for a new one and try again.");
        return;
      }
      await finish();
    } catch {
      setError("We could not check that code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const submit = `min-h-12 w-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 px-6 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 ${focus}`;

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-3">
          <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-full" />
          <span className="text-xl font-bold rcw-gradient-text">RCW Staff</span>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h1 className="text-xl font-bold text-[var(--text)]">
            {step === "password" ? "Staff sign in" : "Enter your code"}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {step === "password"
              ? "Use your staff email and password."
              : "Open your authenticator app and type the 6-digit code."}
          </p>

          <div role="alert" aria-live="polite" className="mt-4 min-h-5 text-sm text-red-500">
            {error}
          </div>

          {step === "password" ? (
            <form onSubmit={onPassword} noValidate className="mt-2 space-y-4">
              <div>
                <label htmlFor="email" className={label}>Email</label>
                <input id="email" type="email" autoComplete="username" inputMode="email"
                  value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
              </div>
              <div>
                <label htmlFor="password" className={label}>Password</label>
                <input id="password" type="password" autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
              </div>
              <button type="submit" disabled={busy} className={submit}>
                {busy ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : (
            <form onSubmit={onCode} noValidate className="mt-2 space-y-4">
              <div>
                <label htmlFor="code" className={label}>Authenticator code</label>
                <input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                  value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className={`${field} tracking-[0.4em]`} />
              </div>
              <label className="flex items-center gap-3 text-sm text-[var(--text)]">
                <input type="checkbox" checked={trust} onChange={(e) => setTrust(e.target.checked)} className={`h-5 w-5 ${focus}`} />
                Trust this device for 30 days
              </label>
              <p className="-mt-2 text-xs text-[var(--dim)]">
                Only tick this on your own phone or computer, not a shared one.
              </p>
              <button type="submit" disabled={busy} className={submit}>
                {busy ? "Checking..." : "Verify and continue"}
              </button>
              <button type="button"
                onClick={async () => { await authClient.signOut(); setStep("password"); setCode(""); setError(""); }}
                className={`min-h-11 w-full rounded-full text-sm text-[var(--muted)] hover:text-[var(--text)] ${focus}`}>
                Back
              </button>
            </form>
          )}

          <p className="mt-5 text-xs text-[var(--dim)]">
            Forgot your password? Ask an admin to help. Self-service reset is not available yet.
          </p>
        </div>

        <p className="mt-4 text-center text-sm">
          <Link href="/" className={`rounded text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}>
            Back to the store
          </Link>
        </p>
      </div>
    </main>
  );
}
