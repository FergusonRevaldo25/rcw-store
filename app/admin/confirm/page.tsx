import type { Metadata } from "next";
import ConfirmForm from "@/components/admin/ConfirmForm";
import { getStaff } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "Confirm it is you | RCW Staff", robots: { index: false } };

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  await getStaff();
  const { next } = await searchParams;
  const safe = next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="text-xl font-bold text-[var(--text)]">Confirm it is you</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          This action is sensitive. Enter a fresh code. It stays confirmed for 10 minutes.
        </p>
        <ConfirmForm next={safe} />
      </div>
    </main>
  );
}