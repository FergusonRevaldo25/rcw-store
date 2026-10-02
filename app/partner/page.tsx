import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PartnerIcon from "@/components/PartnerIcon";
import { partnerTypes, TERMS_NOTE } from "@/lib/partnerTypes";

export const metadata: Metadata = {
  title: "Partner with us | RCW Store",
  description:
    "Sell products, list your brand, or partner with RCW Store as a creator, affiliate or advertiser.",
};

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function PartnerHub() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl p-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Partner with us" }]} />

        <header className="max-w-2xl">
          <h1 className="text-3xl font-extrabold rcw-gradient-text sm:text-4xl">
            Partner with RCW Store
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            Choose the option that fits you and fill in a short application. We
            review every application and reply by email.
          </p>
        </header>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partnerTypes.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/partner/${p.slug}`}
                className={`group flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--border-strong)] ${focus}`}
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-500 text-white">
                  <PartnerIcon name={p.icon} />
                </span>
                <h2 className="mt-4 text-lg font-bold text-[var(--text)]">{p.name}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{p.short}</p>
                <span className="mt-4 text-sm font-semibold text-[var(--text)] underline-offset-2 group-hover:underline">
                  Apply now
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <section aria-labelledby="how-heading" className="mt-12 max-w-2xl">
          <h2 id="how-heading" className="text-xl font-bold text-[var(--text)]">How it works</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--muted)]">
            <li>Pick the option that fits and send your application.</li>
            <li>We review it and email you about next steps.</li>
            <li>Once approved, we set you up and agree the terms with you.</li>
          </ol>
          {/* PLACEHOLDER until real terms are decided */}
          <p className="mt-4 text-sm text-[var(--muted)]">{TERMS_NOTE}</p>
        </section>
      </div>
    </main>
  );
}
