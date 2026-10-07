import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Deals | RCW Store",
  description: "Current deals at RCW Store.",
};

export default function DealsPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl p-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Deals" }]} />
        <h1 className="mb-6 text-2xl font-bold text-[var(--text)] sm:text-3xl">Deals</h1>
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <h2 className="text-lg font-semibold text-[var(--text)]">No deals running right now</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            We keep our prices low every day. When a special offer starts, it will be listed here.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--btn-bg)] px-6 text-sm font-semibold text-[var(--btn-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
          >
            Browse the store
          </Link>
        </section>
      </div>
    </main>
  );
}