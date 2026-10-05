import type { Metadata } from "next";
import Link from "next/link";
import Fill from "@/components/Fill";
import InfoPage, { Section } from "@/components/InfoPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy | RCW Store",
  description: "How RCW Store handles personal information under POPIA.",
};

const review = "mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-[var(--text)]";

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" intro="Draft for review. This page explains how RCW Store handles personal information in connection with the store.">
      <p className={review}>This draft contains operational assumptions and placeholders. Have a South African privacy lawyer review it, confirm actual data flows and retention periods, and complete the highlighted fields before launch.</p>

      <Section title="Who is responsible">
        <p>RCW Store is the responsible party for personal information processed through this store. Legal name: <Fill value={SITE.legalName} label="registered legal name" />. Address: <Fill value={SITE.address} label="business address" />. Privacy contact: <Fill value={SITE.email} label="privacy contact email" />. Information Officer: <Fill value={SITE.informationOfficer} label="Information Officer name and contact details" />.</p>
      </Section>

      <Section title="Information we handle">
        <p>Depending on how you use the store, we may handle account details such as your name and email address; order contact details and order contents; seller or partner application details; support messages; and technical information used for account security, such as session, browser and IP information. The fields requested for a particular service should be limited to what is needed to provide it.</p>
        <p>Payment details are submitted to the payment provider selected at checkout. Confirm with each provider exactly what information it receives and whether any payment credentials are stored by RCW Store.</p>
      </Section>

      <Section title="Why we use it">
        <p>We use information to create and secure accounts, process orders and returns, provide customer support, administer seller applications, prevent fraud and misuse, maintain business records, meet legal obligations, and communicate service updates. We will send promotional messages only where permitted by law and will provide a way to opt out.</p>
      </Section>

      <Section title="Service providers and international processing">
        <p>The store uses Neon for its hosted PostgreSQL database; the project is configured for the AWS Frankfurt region. Vercel provides application hosting and public Blob storage for product images. The store also integrates PayFast and Ozow payment flows. These providers may process information as service providers or independent parties according to their own terms and the services enabled. Review their current privacy terms and data-processing arrangements before launch.</p>
        <p>Some providers or their subprocessors may process information outside South Africa. Confirm the locations and safeguards for each enabled service, and document any cross-border transfers required by POPIA.</p>
      </Section>

      <Section title="Retention and security">
        <p>We keep information only for as long as needed for the purpose collected, account and transaction administration, dispute handling, and applicable legal recordkeeping duties. Retention periods by information type: <Fill value={null} label="retention schedule" />. We use reasonable safeguards, but no internet transmission or storage system can be guaranteed completely secure. If a security compromise occurs, we will take steps required by applicable law.</p>
      </Section>

      <Section title="Your choices and rights">
        <p>Subject to applicable law, you may ask to access or correct personal information, object to certain processing, request deletion where appropriate, or withdraw consent where processing relies on consent. You may also complain to the Information Regulator. Contact us at <Fill value={SITE.email} label="privacy contact email" />. For more information or to make a complaint, visit the <a className="underline" href="https://inforegulator.org.za/">Information Regulator</a>.</p>
      </Section>

      <Section title="Children">
        <p>The store is intended for people able to enter into transactions under applicable law. If a service collects personal information from a child, the required parent or competent-person authorisation and safeguards must be confirmed before that service is offered.</p>
      </Section>

      <Section title="Changes and related information">
        <p>We may update this policy when our services or legal requirements change. The current version will appear on this page. See also our <Link className="underline" href="/cookies">Cookie Policy</Link> and <Link className="underline" href="/terms">Terms &amp; Conditions</Link>.</p>
        <p>Last updated: <Fill value={null} label="policy approval date" />.</p>
      </Section>
    </InfoPage>
  );
}
