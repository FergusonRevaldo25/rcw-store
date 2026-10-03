import type { Metadata } from "next";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "My account | RCW Store" };

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <main className="min-h-[60vh]">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-bold text-[var(--text)]">My account</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Signed in as {user.email}
        </p>

        <dl className="mt-6 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex justify-between gap-4 p-4">
            <dt className="text-sm text-[var(--muted)]">Name</dt>
            <dd className="text-sm font-medium text-[var(--text)]">{user.name}</dd>
          </div>
          <div className="flex justify-between gap-4 p-4">
            <dt className="text-sm text-[var(--muted)]">Email</dt>
            <dd className="text-sm font-medium text-[var(--text)]">{user.email}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/favourites"
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-strong)] px-6 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
          >
            Favourites
          </Link>
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}