"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import type { NavGroup } from "@/lib/admin/nav";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function Sidebar({
  groups,
  onNavigate,
}: {
  groups: NavGroup[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/admin"
        onClick={onNavigate}
        className={`flex h-16 shrink-0 items-center gap-3 border-b border-[var(--border)] px-5 ${focus}`}
      >
        <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full" />
        <span className="text-base font-bold rcw-gradient-text">RCW Staff</span>
      </Link>

      <nav aria-label="Admin sections" className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((g) => (
          <div key={g.title} className="mb-5">
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">
              {g.title}
            </p>
            <ul className="space-y-0.5">
              {g.items.map((i) => (
                <li key={i.href}>
                  {i.built ? (
                    <Link
                      href={i.href}
                      onClick={onNavigate}
                      aria-current={active(i.href) ? "page" : undefined}
                      className={`flex min-h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors ${focus} ${
                        active(i.href)
                          ? "bg-gradient-to-r from-violet-600/20 to-fuchsia-500/20 text-[var(--text)] ring-1 ring-fuchsia-500/40"
                          : "text-[var(--text)] hover:bg-[var(--hover)]"
                      }`}
                    >
                      {i.label}
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="flex min-h-9 items-center justify-between rounded-lg px-3 text-sm text-[var(--dim)]"
                    >
                      {i.label}
                      <span className="text-[10px] uppercase tracking-wider">Soon</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}