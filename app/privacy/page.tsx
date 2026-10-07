import type { Metadata } from "next";
import type { ReactNode } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy policy | RCW Store",
  description: "How RCW Store collects, uses and protects your personal information.",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-[var(--muted)]">{children}</div>
    </section>
  );
}

const ul = "list-disc space-y-1 pl-5";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl p-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy policy" }]} />
        <h1 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">Privacy policy</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Last updated {LEGAL.lastUpdated}</p>

        {!LEGAL.reviewed && (
          <p role="note" className="mt-4 rounded-lg border border-amber-500/50 p-3 text-sm text-[var(--text)]">
            Draft. This policy has not yet been reviewed by a legal professional. Items marked
            [to be confirmed] are still being finalised.
          </p>
        )}

        <Section title="1. Who we are">
          <p>
            This policy explains how {LEGAL.companyName} (registration number{" "}
            {LEGAL.registrationNumber}), trading as RCW Store, handles personal information in line
            with the Protection of Personal Information Act, 2013 (POPIA). We are the responsible
            party for the information described here.
          </p>
          <p>Address: {LEGAL.address}. Email: {LEGAL.contactEmail}.</p>
          <p>
            Our Information Officer is {LEGAL.informationOfficer} ({LEGAL.informationOfficerEmail}).
          </p>
        </Section>

        <Section title="2. What we collect">
          <ul className={ul}>
            <li>Account details: your name and email address, and your password, which we store only in a scrambled (hashed) form.</li>
            <li>Order details: what you bought, amounts, and the date. When delivery is offered, your delivery address and phone number.</li>
            <li>Sign-in information: session records so you stay signed in, and security checks such as two-factor codes for staff accounts.</li>
            <li>Information you send us: for example support messages, or a partner or seller application.</li>
            <li>Data on your device: your cart, favourites, recently viewed items and theme choice are kept in your browser. A session cookie keeps you signed in.</li>
          </ul>
          <p>We do not ask for your card number on this site. Card slips from the shop till are recorded by reference only.</p>
        </Section>

        <Section title="3. Why we use it">
          <ul className={ul}>
            <li>To create and run your account and to process and deliver your orders.</li>
            <li>To keep the site and our staff systems secure and to prevent fraud.</li>
            <li>To keep records the law requires, such as tax and accounting records.</li>
            <li>To answer your questions and handle returns and refunds.</li>
            <li>For marketing, only if you have agreed to it. You can withdraw that at any time.</li>
          </ul>
        </Section>

        <Section title="4. Who we share it with">
          <p>We do not sell your personal information. We share it only with:</p>
          <ul className={ul}>
            <li>Service providers who run our systems for us: our database host (Neon), and our website host and file storage (Vercel).</li>
            <li>Payment providers and couriers, once those services are switched on. We will list them here when they are.</li>
            <li>Authorities, where the law requires it.</li>
          </ul>
          <p>These providers may only use your information to provide their service to us.</p>
        </Section>

        <Section title="5. Storage outside South Africa">
          <p>
            Our database is hosted in Frankfurt, Germany, and our website and file storage are
            provided by Vercel, which may process data in other countries. Where information leaves
            South Africa we rely on the provider&apos;s contractual and security protections, as
            POPIA requires.
          </p>
        </Section>

        <Section title="6. How we protect it">
          <p>
            We use measures such as encrypted connections, hashed passwords, role-based access for
            staff with two-factor sign-in, and a tamper-resistant record of staff actions. No system
            is perfectly secure. If a breach affects your information we will tell you and the
            Information Regulator as the law requires.
          </p>
        </Section>

        <Section title="7. How long we keep it">
          <p>{LEGAL.retention}</p>
        </Section>

        <Section title="8. Your rights">
          <p>You may ask us to:</p>
          <ul className={ul}>
            <li>tell you what personal information we hold about you;</li>
            <li>correct information that is wrong or out of date;</li>
            <li>delete information we no longer need a lawful reason to keep;</li>
            <li>stop using your information for marketing, or object to other uses.</li>
          </ul>
          <p>
            Email {LEGAL.informationOfficerEmail} and we will respond. We may need to confirm your
            identity first, and some records we are legally required to keep.
          </p>
        </Section>

        <Section title="9. Complaints">
          <p>
            If you are unhappy with how we handled your information, please contact us first. You
            may also complain to the Information Regulator (South Africa) at inforegulator.org.za.
          </p>
        </Section>

        <Section title="10. Changes">
          <p>We may update this policy. The date at the top shows when it last changed.</p>
        </Section>
      </div>
    </main>
  );
}