"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import InstallButton from "@/components/admin/InstallButton";
import Sidebar from "@/components/admin/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { authClient } from "@/lib/auth/client";
import type { NavGroup } from "@/lib/admin/nav";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function AdminShell({
  groups,
  email,
  children,
}: {
  groups: NavGroup[];
  email: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[var(--border)] bg-[var(--menu)] lg:block">
        <Sidebar groups={groups} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" aria-hidden="true" onClick={() => setOpen(false)} />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Admin menu"
            className="absolute inset-y-0 left-0 w-72 max-w-[85%] border-r border-[var(--border)] bg-[var(--menu)]"
          >
            <Sidebar groups={groups} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--header)] px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className={`grid h-10 w-10 place-items-center rounded-lg border border-[var(--border)] text-[var(--text)] lg:hidden ${focus}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <InstallButton />
            <Link
              href="/"
              className={`hidden rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] sm:block ${focus}`}
            >
              View store
            </Link>
            <ThemeToggle />
            <span className="hidden max-w-48 truncate text-sm text-[var(--muted)] md:block">{email}</span>
            <button
              type="button"
              onClick={signOut}
              className={`min-h-10 rounded-full border border-[var(--border-strong)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </div>
    </div>
  );
}