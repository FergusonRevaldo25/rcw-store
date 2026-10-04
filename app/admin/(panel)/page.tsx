import type { Metadata } from "next";
import Link from "next/link";
import { getStaff } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "Admin | RCW Store" };

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { permissions } = await getStaff();
  const { denied } = await searchParams;

  return (
    <main>
      <h1 className="text-2xl font-bold text-[var(--text)]">Dashboard</h1>
      {denied && (
        <p role="alert" className="mt-3 rounded-lg border border-red-500/40 p-3 text-sm text-red-500">
          You do not have permission to open that page.
        </p>
      )}
      <p className="mt-2 text-sm text-[var(--muted)]">
        More sections will appear here as they are built.
      </p>
      {permissions.has("sellers:view") && (
        <Link
          href="/admin/sellers"
          className="mt-6 inline-flex min-h-11 items-center rounded-full border border-[var(--border-strong)] px-6 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)]"
        >
          Review seller applications
        </Link>
      )}
    </main>
  );
}