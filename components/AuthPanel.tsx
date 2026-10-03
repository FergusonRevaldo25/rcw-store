"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";

type Mode = "sign-in" | "sign-up";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

const field =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-fuchsia-500/60";

const label = "mb-1.5 block text-sm font-medium text-[var(--text)]";

export default function AuthPanel({
  mode,
  onSwitch,
  onDone,
  onSkip,
  onNavigate,
  headingId,
  headingLevel = 2,
}: {
  mode: Mode;
  onSwitch: (mode: Mode) => void;
  onDone: () => void;
  onSkip?: () => void;
  onNavigate?: () => void;
  headingId?: string;
  headingLevel?: 1 | 2;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const up = mode === "sign-up";
  const H = headingLevel === 1 ? "h1" : "h2";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    const name = String(f.get("name") ?? "").trim();

    if (up && name.length < 2) return setError("Enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setError("Enter a valid email address.");
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");

    setError("");
    setBusy(true);
    const res = up
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password });
    setBusy(false);

    if (res.error) {
      setError(
        res.error.message ??
          (up ? "Could not create your account." : "Could not sign you in.")
      );
      return;
    }
    onDone();
  }

  return (
    <div>
      <div
        role="group"
        aria-label="Sign in or create an account"
        className="mb-6 grid grid-cols-2 rounded-full bg-[var(--hover)] p-1"
      >
        {(["sign-in", "sign-up"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => {
              setError("");
              onSwitch(m);
            }}
            className={`min-h-10 rounded-full px-4 text-sm font-semibold transition-colors ${focus} ${
              mode === m
                ? "bg-[var(--btn-bg)] text-[var(--btn-fg)]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {m === "sign-in" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <H id={headingId} className="text-2xl font-bold text-[var(--text)]">
        {up ? "Create your account" : "Welcome back"}
      </H>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {up
          ? "It only takes a minute."
          : "Sign in to your RCW Store account."}
      </p>

      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        {up && (
          <div>
            <label htmlFor="auth-name" className={label}>
              Full name
            </label>
            <input
              id="auth-name"
              name="name"
              autoComplete="name"
              className={`${field} ${focus}`}
            />
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className={label}>
            Email
          </label>
          <input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={`${field} ${focus}`}
          />
        </div>

        <div>
          <label htmlFor="auth-password" className={label}>
            Password
          </label>
          <div className="relative">
            <input
              id="auth-password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete={up ? "new-password" : "current-password"}
              className={`${field} pr-16 ${focus}`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-pressed={show}
              aria-label={show ? "Hide password" : "Show password"}
              className={`absolute right-2 top-1/2 min-h-8 -translate-y-1/2 rounded-lg px-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] ${focus}`}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
          {up && (
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              Use at least 8 characters.
            </p>
          )}
        </div>

        <div role="alert" className="min-h-5 text-sm text-red-500">
          {error}
        </div>

        <button
          type="submit"
          disabled={busy}
          className={`min-h-12 w-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 ${focus}`}
        >
          {busy ? "Please wait..." : up ? "Create account" : "Sign in"}
        </button>

        {up && (
          <p className="text-xs leading-relaxed text-[var(--muted)]">
            By creating an account you agree to our{" "}
            <Link
              href="/terms"
              onClick={onNavigate}
              className={`rounded underline underline-offset-2 hover:text-[var(--text)] ${focus}`}
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              onClick={onNavigate}
              className={`rounded underline underline-offset-2 hover:text-[var(--text)] ${focus}`}
            >
              Privacy Policy
            </Link>
            .
          </p>
        )}
      </form>

      <div className="mt-6 space-y-3 border-t border-[var(--border)] pt-5 text-center text-sm">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className={`min-h-10 rounded-full px-4 font-medium text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}
          >
            Continue browsing
          </button>
        )}
        <p className="text-[var(--muted)]">
          Want to sell on RCW Store?{" "}
          <Link
            href="/partner"
            onClick={onNavigate}
            className={`rounded font-semibold text-[var(--text)] underline underline-offset-2 ${focus}`}
          >
            Become a seller
          </Link>
        </p>
      </div>
    </div>
  );
}