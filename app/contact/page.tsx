import type { Metadata } from "next";
import Fill from "@/components/Fill";
import InfoPage, { Section } from "@/components/InfoPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us | RCW Store",
  description: "How to reach RCW Store.",
};

const row = "flex flex-wrap justify-between gap-2 p-4";

export default function ContactPage() {
  return (
    <InfoPage
      title="Contact us"
      intro="For order questions, please include your order number so we can help faster."
    >
      <Section title="Ways to reach us">
        <dl className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm">
          <div className={row}>
            <dt className="text-[var(--muted)]">Email</dt>
            <dd className="font-medium text-[var(--text)]">
              <Fill value={SITE.email} label="support email" />
            </dd>
          </div>
          <div className={row}>
            <dt className="text-[var(--muted)]">Phone</dt>
            <dd className="font-medium text-[var(--text)]">
              <Fill value={SITE.phone} label="phone number" />
            </dd>
          </div>
          <div className={row}>
            <dt className="text-[var(--muted)]">WhatsApp</dt>
            <dd className="font-medium text-[var(--text)]">
              <Fill value={SITE.whatsapp} label="WhatsApp number" />
            </dd>
          </div>
          <div className={row}>
            <dt className="text-[var(--muted)]">Hours</dt>
            <dd className="font-medium text-[var(--text)]">
              <Fill value={SITE.hours} label="support hours" />
            </dd>
          </div>
        </dl>
      </Section>

      <Section title="Our details">
        <dl className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm">
          <div className={row}>
            <dt className="text-[var(--muted)]">Trading as</dt>
            <dd className="font-medium text-[var(--text)]">{SITE.name}</dd>
          </div>
          <div className={row}>
            <dt className="text-[var(--muted)]">Registered name</dt>
            <dd className="font-medium text-[var(--text)]">
              <Fill value={SITE.legalName} label="registered name" />
            </dd>
          </div>
          <div className={row}>
            <dt className="text-[var(--muted)]">Address</dt>
            <dd className="font-medium text-[var(--text)]">
              <Fill value={SITE.address} label="business address" />
            </dd>
          </div>
        </dl>
      </Section>
    </InfoPage>
  );
}