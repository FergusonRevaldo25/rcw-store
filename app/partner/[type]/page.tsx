import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import PartnerForm from "@/components/PartnerForm";
import PartnerIcon from "@/components/PartnerIcon";
import { getPartnerType, partnerTypes, TERMS_NOTE } from "@/lib/partnerTypes";

type Props = { params: Promise<{ type: string }> };

export function generateStaticParams() {
  return partnerTypes.map((p) => ({ type: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const t = getPartnerType(type);
  if (!t) return { title: "Page not found | RCW Store" };
  return { title: `${t.name} | Partner with RCW Store`, description: t.blurb };
}

export default async function PartnerTypePage({ params }: Props) {
  const { type } = await params;
  const t = getPartnerType(type);
  if (!t) notFound();

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl p-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Partner with us", href: "/partner" },
            { label: t.name },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-500 text-white">
              <PartnerIcon name={t.icon} size={24} />
            </span>
            <h1 className="mt-4 text-3xl font-extrabold rcw-gradient-text">{t.name}</h1>
            <p className="mt-3 text-[var(--muted)]">{t.blurb}</p>

            <h2 className="mt-6 text-sm font-semibold text-[var(--text)]">Good for</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
              {t.goodFor.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>

            {t.note && (
              <p className="mt-6 rounded-lg border border-[var(--border)] p-3 text-sm text-[var(--muted)]">
                {t.note}
              </p>
            )}
            {/* PLACEHOLDER until real terms are decided */}
            <p className="mt-4 text-sm text-[var(--muted)]">{TERMS_NOTE}</p>
          </div>

          <div className="lg:col-span-3">
            <PartnerForm type={t} />
          </div>
        </div>
      </div>
    </main>
  );
}
