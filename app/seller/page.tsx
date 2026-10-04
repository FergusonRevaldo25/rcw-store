import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { sellers } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Seller area | RCW Store" };

const btn =
  "inline-flex min-h-11 items-center rounded-full border border-[var(--border-strong)] px-6 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default async function SellerPage() {
  const user = await requireUser();
  const [seller] = await db
    .select()
    .from(sellers)
    .where(eq(sellers.userId, user.id))
    .limit(1);

  if (!seller) redirect("/sell");

  const views = {
    pending: {
      title: "Application under review",
      text: "Thanks for applying. We are reviewing your application and will update this page once a decision is made.",
    },
    approved: {
      title: "You are approved",
      text: "Your seller account is active. Product uploads and order tracking are being built and will appear here.",
    },
    rejected: {
      title: "Application not approved",
      text: seller.rejectionReason
        ? `Reason: ${seller.rejectionReason}`
        : "Your application was not approved this time.",
    },
    suspended: {
      title: "Seller account suspended",
      text: "Your seller account is currently suspended. Please contact support.",
    },
  } as const;
  const view = views[seller.status];

  return (
    <main className="min-h-[60vh]">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
          {seller.businessName}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--text)]">
          {view.title}
        </h1>
        <p role="status" className="mt-2 text-[var(--muted)]">
          {view.text}
        </p>

        <dl className="mt-6 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {[
            ["Status", seller.status],
            ["Category", seller.category],
            ["Contact", seller.contactPhone],
            [
              "Applied",
              seller.createdAt.toLocaleDateString("en-ZA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            ],
          ].map(([k, val]) => (
            <div key={k} className="flex justify-between gap-4 p-4">
              <dt className="text-sm text-[var(--muted)]">{k}</dt>
              <dd className="text-sm font-medium capitalize text-[var(--text)]">
                {val}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6">
          <Link href="/account" className={btn}>
            Back to my account
          </Link>
        </div>
      </div>
    </main>
  );
}