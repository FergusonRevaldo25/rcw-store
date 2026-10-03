"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useAuthModal } from "@/components/AuthModalProvider";
import { authClient, useSession } from "@/lib/auth/client";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

const item = `block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--hover)] ${focus}`;

const iconButton = `relative flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] px-2.5 text-sm text-[var(--text)] transition-colors hover:bg-[var(--hover)] ${focus}`;

export default function UserMenu() {
  const { data: session, isPending } = useSession();
  const { openAuth } = useAuthModal();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  async function signOut() {
    setBusy(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setOpen(false);
          router.push("/");
          router.refresh();
        },
      },
    });
    setBusy(false);
  }

  // Reserve the space while the session loads so nothing jumps.
  if (isPending) {
    return (
      <div
        aria-hidden="true"
        className="h-10 w-10 animate-pulse rounded-full bg-[var(--hover)] motion-reduce:animate-none"
      />
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => openAuth("sign-in")}
          aria-label="Sign in or create an account"
          className={iconButton}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
          <span className="hidden lg:inline">Sign in</span>
        </button>
        <button
          type="button"
          onClick={() => openAuth("sign-up")}
          className={`hidden h-10 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 lg:inline-flex lg:items-center ${focus}`}
        >
          Sign up
        </button>
      </div>
    );
  }

  const user = session.user as typeof session.user & { kind?: string };
  const initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Account menu for ${user.name || user.email}`}
        className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-500 text-sm font-bold text-white transition-transform hover:scale-105 ${focus}`}
      >
        {initial}
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-[var(--border)] bg-[var(--menu)] p-2 shadow-xl"
        >
          <div className="border-b border-[var(--border)] px-3 pb-3 pt-2">
            <p className="truncate text-sm font-semibold text-[var(--text)]">
              {user.name}
            </p>
            <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
          </div>

          <div className="py-1">
            <Link href="/account" onClick={() => setOpen(false)} className={item}>
              My account
            </Link>
            <Link href="/orders" onClick={() => setOpen(false)} className={item}>
              Orders
            </Link>
            <Link href="/favourites" onClick={() => setOpen(false)} className={item}>
              Favourites
            </Link>
            {user.kind === "seller" && (
              <Link href="/seller" onClick={() => setOpen(false)} className={item}>
                Seller dashboard
              </Link>
            )}
            {user.kind === "staff" && (
              <Link href="/admin" onClick={() => setOpen(false)} className={item}>
                Admin
              </Link>
            )}
          </div>

          <div className="border-t border-[var(--border)] pt-1">
            <button
              type="button"
              onClick={signOut}
              disabled={busy}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--text)] hover:bg-[var(--hover)] disabled:opacity-60 ${focus}`}
            >
              {busy ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}