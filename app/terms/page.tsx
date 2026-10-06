import type { Metadata } from "next";
import Link from "next/link";
import Fill from "@/components/Fill";
import { Section } from "@/components/InfoPage";
import LegalPage, { bullets } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms and conditions | RCW Store",
  description: "The terms for using RCW Store and buying from it.",
};

const link =
  "rounded text-[var(--text)] underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and conditions"
      intro="By using RCW Store or placing an order, you agree to these terms. Please read them together with our privacy policy, shipping info and returns page."
    >
      <Section title="About us">
        <p>
          RCW Store is run by{" "}
          <Fill value={SITE.legalName} label="registered name" />. Our contact
          details and address are on the{" "}
          <Link href="/contact" className={link}>
            contact page
          </Link>
          .
        </p>
      </Section>

      <Section title="Using the site and your account">
        <ul className={bullets}>
          <li>Give us correct information and keep your password safe.</li>
          <li>You are responsible for what happens under your account.</li>
          <li>
            We may suspend an account that is used to commit fraud or abuse the
            site.
          </li>
        </ul>
      </Section>

      <Section title="Products and prices">
        <p>
          All prices are in South African Rand (ZAR).{" "}
          {LEGAL.vatRegistered === null ? (
            <Fill value={null} label="VAT statement" where="lib/legal.ts (vatRegistered)" />
          ) : LEGAL.vatRegistered ? (
            <>
              Prices include VAT.{" "}
              {SITE.vatNumber ? (
                <>Our VAT number is {SITE.vatNumber}.</>
              ) : (
                <Fill value={null} label="VAT number" />
              )}
            </>
          ) : (
            <>We are not registered for VAT, so no VAT is added to prices.</>
          )}
        </p>
        <p>
          We take care to show correct prices and descriptions. If we find a
          price or stock error on an order, we will contact you and you may
          choose to confirm or cancel it. If you cancel, you get a full refund.
        </p>
      </Section>

      <Section title="Placing an order">
        <p>
          An order is accepted once we receive your payment and your order
          number is shown to you. We may cancel an order if an item is out of
          stock or cannot be delivered. If we do, you get a full refund.
        </p>
      </Section>

      <Section title="Payment">
        <p>
          Payments are processed securely by{" "}
          <Fill value={LEGAL.paymentProviders} label="payment provider" where="lib/legal.ts" />
          . We do not see or store your card details.
        </p>
      </Section>

      <Section title="Delivery, returns and refunds">
        <p>
          See our{" "}
          <Link href="/shipping" className={link}>
            shipping info
          </Link>{" "}
          and{" "}
          <Link href="/returns" className={link}>
            returns and refunds
          </Link>{" "}
          pages. They form part of these terms. Nothing in these terms limits
          your rights under South African consumer law.
        </p>
      </Section>

      <Section title="Digital products">
        <p>
          A digital product is licensed to you, not sold. Unless the product
          page says otherwise, you may use it for your own personal or business
          purposes, but you may not resell, share or redistribute it.
        </p>
      </Section>

      <Section title="Our content">
        <p>
          The RCW Store name, logo, text and images belong to us or our
          licensors. You may not copy or reuse them without our permission.
        </p>
      </Section>

      <Section title="Our responsibility">
        <p>
          To the extent the law allows, we are not responsible for indirect or
          consequential loss, or for problems caused by things outside our
          control. Nothing in these terms excludes liability that cannot be
          excluded by law.
        </p>
      </Section>

      <Section title="Your information">
        <p>
          How we handle your personal information is explained in our{" "}
          <Link href="/privacy" className={link}>
            privacy policy
          </Link>{" "}
          and{" "}
          <Link href="/cookies" className={link}>
            cookie policy
          </Link>
          .
        </p>
      </Section>

      <Section title="Complaints and governing law">
        <p>
          Please contact us first and we will try to put things right. You may
          also take a complaint to the National Consumer Commission. These terms
          are governed by the laws of the Republic of South Africa.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may update these terms. The version in force when you place an
          order applies to that order.
        </p>
      </Section>
    </LegalPage>
  );
}