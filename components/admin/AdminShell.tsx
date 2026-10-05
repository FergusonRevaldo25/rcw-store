"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import InstallButton from "@/components/admin/InstallButton";
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
  const pathname = usePathname();

  // The longest matching path wins, so /admin/pos/sales does not also
  // light up /admin/pos.
  const best = groups
    .flatMap((g) => g.items.map((i) => ({ href: i.href, group: g.title })))
    .filter((i) =>
      i.href === "/admin"
        ? pathname === "/admin"
        : pathname === i.href || pathname.startsWith(i.href + "/")
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  const activeGroup = groups.find((g) => g.title === best?.group);

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
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--header)] backdrop-blur">
        {/* Row 1: brand and account */}
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/admin" className={`flex items-center gap-3 rounded-lg ${focus}`}>
            <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full" />
            <span className="text-base font-bold rcw-gradient-text">RCW Staff</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
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
        </div>

        {/* Row 2: main areas */}
        <nav aria-label="Admin areas" className="border-t border-[var(--border)]">
          <ul className="mx-auto flex max-w-screen-2xl gap-1 overflow-x-auto px-4 sm:px-6">
            {groups.map((g) => {
              const isActive = g.title === activeGroup?.title;
              return (
                <li key={g.title} className="shrink-0">
                  <Link
                    href={g.items[0].href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative inline-flex min-h-11 items-center px-3 text-sm font-medium whitespace-nowrap transition-colors ${focus} ${
                      isActive
                        ? "text-[var(--text)] after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-violet-600 after:via-fuchsia-500 after:to-orange-500"
                        : "text-[var(--muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    {g.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Row 3: pages inside the active area (hidden when there is only one) */}
        {activeGroup && activeGroup.items.length > 1 && (
          <nav aria-label={`${activeGroup.title} pages`} className="border-t border-[var(--border)] bg-[var(--surface)]">
            <ul className="mx-auto flex max-w-screen-2xl gap-2 overflow-x-auto px-4 py-2 sm:px-6">
              {activeGroup.items.map((i) => {
                const isActive = i.href === best?.href;
                return (
                  <li key={i.href} className="shrink-0">
                    <Link
                      href={i.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`inline-flex min-h-10 items-center rounded-lg px-4 text-sm whitespace-nowrap transition-colors ${focus} ${
                        isActive
                          ? "bg-[var(--hover)] font-semibold text-[var(--text)] ring-1 ring-fuchsia-500/40"
                          : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
                      }`}
                    >
                      {i.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </header>

      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
    </div>
  );
}