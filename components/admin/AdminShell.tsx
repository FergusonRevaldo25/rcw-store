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

// Same width and side padding as AdminContainer, so everything lines up.
const wrap = "mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10";

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
  const initial = (email.trim()[0] ?? "?").toUpperCase();

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/admin/login");
          router.refresh();
        },
      },
    });
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--header)] backdrop-blur-xl">
        <div aria-hidden="true" className="h-0.5 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500" />

        <div className={`${wrap} flex h-16 items-center justify-between gap-3`}>
          <Link href="/admin" className={`flex items-center gap-3 rounded-lg ${focus}`}>
            <Image src="/logo.png" alt="" width={36} height={36} className="h-9 w-9 rounded-full ring-2 ring-fuchsia-500/40" />
            <span className="text-base font-bold rcw-gradient-text">RCW Staff</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <InstallButton />
            <Link
              href="/" target="_blank" rel="noopener noreferrer"
              className={`hidden rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] sm:block ${focus}`}
            >
              View store
            </Link>
            <ThemeToggle />
            <span
              title={email}
              aria-label={`Signed in as ${email}`}
              className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-500 text-sm font-bold text-white"
            >
              {initial}
            </span>
            <button
              type="button"
              onClick={signOut}
              className={`min-h-10 rounded-full border border-[var(--border-strong)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}
            >
              Sign out
            </button>
          </div>
        </div>

        <nav aria-label="Admin areas" className="border-t border-[var(--border)]">
          <ul className={`${wrap} flex gap-1 overflow-x-auto`}>
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

        {activeGroup && activeGroup.items.length > 1 && (
          <nav aria-label={`${activeGroup.title} pages`} className="border-t border-[var(--border)] bg-[var(--surface)]">
            <ul className={`${wrap} flex gap-2 overflow-x-auto py-2`}>
              {activeGroup.items.map((i) => {
                const isActive = i.href === best?.href;
                return (
                  <li key={i.href} className="shrink-0">
                    <Link
                      href={i.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm whitespace-nowrap transition-colors ${focus} ${
                        isActive
                          ? "bg-[var(--hover)] font-semibold text-[var(--text)] ring-1 ring-fuchsia-500/50"
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

      {/* AdminContainer (in the panel layout) provides the centered padded box. */}
      {children}
    </div>
  );
}
