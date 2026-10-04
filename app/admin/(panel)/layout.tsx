import Link from "next/link";
import type { ReactNode } from "react";
import { getStaff } from "@/lib/rbac/guard";

const link =
  "rounded-lg px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, permissions } = await getStaff();

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <nav aria-label="Admin" className="flex flex-wrap items-center gap-1">
          <span className="mr-2 text-sm font-bold rcw-gradient-text">Admin</span>
          <Link href="/admin" className={link}>Dashboard</Link>
          {permissions.has("sellers:view") && (
            <Link href="/admin/sellers" className={link}>Sellers</Link>
          )}
        </nav>
        <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <span>{user.email}</span>
          <Link href="/" className={link}>Back to store</Link>
        </div>
      </div>
      {children}
    </div>
  );
}