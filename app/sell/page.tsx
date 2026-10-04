import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import SellerApplyForm from "@/components/SellerApplyForm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { sellers } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Become a seller | RCW Store" };

const btn =
  "inline-flex min-h-11 items-center rounded-full px-6 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default async function SellPage() {
  const session = await getSession();

  if (session) {
    const existing = await db
      .select({ id: sellers.id })
      .from(sellers)
      .where(eq(sellers.userId, session.user.id))
      .limit(1);
    if (existing.length) redirect("/seller");
  }

  return (
    <main className="min-h-[70vh]">
      <div className="mx-auto max-w-xl px-6 py-12">
        <h1 className="text-2xl font-bold text-[var(--text)]">
          Sell on RCW Store
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Tell us about your business. We review every application before a
          seller account goes live.
        </p>

        {session ? (
          <SellerApplyForm />
        ) : (
          <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm text-[var(--text)]">
              Sign in or create an account first, then come back to apply.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/sign-in"
                className={`${btn} bg-[var(--btn-bg)] text-[var(--btn-fg)]`}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className={`${btn} border border-[var(--border-strong)] text-[var(--text)] hover:bg-[var(--hover)]`}
              >
                Create account
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}