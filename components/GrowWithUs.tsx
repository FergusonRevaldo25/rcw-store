import Link from "next/link";
import PartnerIcon from "@/components/PartnerIcon";
import { partnerTypes } from "@/lib/partnerTypes";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function GrowWithUs() {
  return (
    <section
      aria-labelledby="grow-heading"
      className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
    >
      <div className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-orange-500 p-6 text-white sm:p-8">
        <h2 id="grow-heading" className="text-2xl font-extrabold sm:text-3xl">
          Grow with RCW Store
        </h2>
        <p className="mt-2 max-w-xl text-sm text-white/90">
          Sell your products, list your brand, or partner with us as a creator,
          affiliate or advertiser.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/partner/sell-products"
            className={`inline-flex min-h-10 items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-black ${focus}`}
          >
            Start selling
          </Link>
          <Link
            href="/partner"
            className={`inline-flex min-h-10 items-center rounded-full border border-white/60 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10 ${focus}`}
          >
            See all partner options
          </Link>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {partnerTypes
          .filter((p) => p.slug !== "other")
          .map((p) => (
            <li key={p.slug}>
              <Link
                href={`/partner/${p.slug}`}
                className={`flex min-h-12 items-center gap-3 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}
              >
                <span className="text-fuchsia-500">
                  <PartnerIcon name={p.icon} size={20} />
                </span>
                {p.name}
              </Link>
            </li>
          ))}
      </ul>
    </section>
  );
}
