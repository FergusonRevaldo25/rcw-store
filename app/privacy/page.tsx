import type { Metadata } from "next";
import Fill from "@/components/Fill";
import { Section } from "@/components/InfoPage";
import LegalPage, { bullets } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy | RCW Store",
  description: "How RCW Store collects, uses and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="This policy explains how RCW Store collects, uses and protects your personal information, in line with the Protection of Personal Information Act (POPIA)."
    >
      <Section title="Who is responsible">
        <p>
          The responsible party is{" "}
          <Fill value={SITE.legalName} label="registered name" />, trading as{" "}
          {SITE.name}.
        </p>
        <p>
          Our information officer is{" "}
          <Fill value={SITE.informationOfficer} label="information officer" />.
          You can reach us at <Fill value={SITE.email} label="support email" />.
        </p>
      </Section>

      <Section title="What we collect">
        <ul className={bullets}>
          <li>
            <strong>Account details:</strong> your name, email address and
            password. Your password is stored in a protected form, never as
            plain text.
          </li>
          <li>
            <strong>Order details:</strong> your name, email address, phone
            number and delivery address when you place an order.
          </li>
          <li>
            <strong>Payment details:</strong> card and bank details are entered
            on our payment provider&apos;s secure page. We do not see or store
            them. We keep only the payment status and a reference.
          </li>
          <li>
            <strong>Technical details:</strong> your IP address and the type of
            browser and device you use, kept with your sign-in sessions for
            security.
          </li>
          <li>
            <strong>Saved in your browser:</strong> your cart, favourites,
            recently viewed items and theme choice. See our cookie policy.
          </li>
          <li>
            <strong>Messages:</strong> anything you send us when you contact us.
          </li>
        </ul>
      </Section>

      <Section title="Why we use it">
        <ul className={bullets}>
          <li>To create and manage your account.</li>
          <li>To take payment for, pack, deliver and support your orders.</li>
          <li>To prevent fraud and keep the site secure.</li>
          <li>To keep records that the law requires, such as tax and consumer records.</li>
          <li>To answer your questions and complaints.</li>
        </ul>
        <p>
          We do not send marketing messages at the moment. If we start, we will
          ask for your consent first, and you can opt out at any time.
        </p>
      </Section>

      <Section title="On what basis">
        <p>
          We use your information where it is needed to carry out a contract
          with you (such as an order), where the law requires it, where it is
          in your or our legitimate interests (such as keeping the site
          secure), or where you have given your consent.
        </p>
      </Section>

      <Section title="Who we share it with">
        <p>
          We do not sell your personal information. We share it only with
          service providers who help us run the store, and only what they need:
        </p>
        <ul className={bullets}>
          <li>Website hosting: Vercel.</li>
          <li>Database: Neon, hosted in Frankfurt, Germany.</li>
          <li>
            Payments:{" "}
            <Fill value={LEGAL.paymentProviders} label="payment provider" where="lib/legal.ts" />.
          </li>
          <li>
            Delivery: <Fill value={SITE.courier} label="courier" /> receives
            your name, phone number and delivery address to deliver your order.
          </li>
          <li>Authorities, where the law requires us to share information.</li>
        </ul>
      </Section>

      <Section title="Information outside South Africa">
        <p>
          Some of our service providers store or process information outside
          South Africa. For example, our database is in Frankfurt, Germany.
          Where this happens, we rely on the conditions that POPIA allows for
          such transfers.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          We keep information only for as long as we need it for the purposes
          above, or as long as the law requires. Order and tax records are kept
          for the period South African law requires. You can ask us to delete
          your account at any time.
        </p>
      </Section>

      <Section title="How we protect it">
        <ul className={bullets}>
          <li>The site uses encrypted connections.</li>
          <li>Staff accounts require two-factor authentication, and access is limited by role.</li>
          <li>Changes to orders, refunds and accounts are recorded in an audit log.</li>
        </ul>
        <p>
          If a security breach affects your information, we will tell you and
          the Information Regulator as the law requires.
        </p>
      </Section>

      <Section title="Your rights">
        <p>You may ask us to:</p>
        <ul className={bullets}>
          <li>tell you what personal information we hold about you;</li>
          <li>correct information that is wrong or out of date;</li>
          <li>delete information we no longer need;</li>
          <li>stop using your information for a purpose you object to; and</li>
          <li>withdraw consent you gave us.</li>
        </ul>
        <p>
          To make a request, email <Fill value={SITE.email} label="support email" />.
          We may need to confirm who you are first. If you are not happy with
          how we handle your information, you can complain to the Information
          Regulator (South Africa).
        </p>
      </Section>

      <Section title="Children">
        <p>
          Our store is not meant for people under 18, and we do not knowingly
          collect their information.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          We may update this policy. The date at the top shows when it last
          changed.
        </p>
      </Section>
    </LegalPage>
  );
}