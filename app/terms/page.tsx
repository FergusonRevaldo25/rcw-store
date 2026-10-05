import type { Metadata } from "next";
import Link from "next/link";
import Fill from "@/components/Fill";
import InfoPage, { Section } from "@/components/InfoPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions | RCW Store",
  description: "Terms for using and buying from RCW Store.",
};

const review = "mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-[var(--text)]";

export default function TermsPage() {
  return (
    <InfoPage title="Terms & Conditions" intro="Draft terms for using RCW Store and placing an order.">
      <p className={review}>This is a working draft with business details and commercial terms still to confirm. Have a South African lawyer review it before accepting orders.</p>

      <Section title="The store operator">
        <p>RCW Store is operated by <Fill value={SITE.legalName} label="registered legal name" />, trading as RCW Store, registration number <Fill value={SITE.registrationNumber} label="company or business registration number" />. Contact: <Fill value={SITE.email} label="customer contact email" />; address: <Fill value={SITE.address} label="business address" />.</p>
      </Section>

      <Section title="Using the store">
        <p>Use the store lawfully and provide accurate information when creating an account or placing an order. Keep your account credentials secure and tell us promptly if you suspect unauthorised access. We may restrict access where reasonably needed to protect the store, customers or legal rights.</p>
      </Section>

      <Section title="Products, prices and orders">
        <p>Product descriptions, availability, prices, delivery charges and applicable taxes should be shown before an order is placed. An order is subject to availability and payment authorisation. We will send an order confirmation using the contact details supplied. If a listing or price contains an obvious error, we will contact you to resolve it in accordance with applicable consumer law.</p>
        <p>Currency: South African rand (ZAR). VAT status and price treatment: <Fill value={SITE.vatNumber} label="confirm VAT registration and whether prices include VAT" />.</p>
      </Section>

      <Section title="Payment and delivery">
        <p>Available payment methods and any delivery charges will be shown at checkout before you confirm payment. Delivery coverage, courier, timing and fees are described on our <Link className="underline" href="/shipping">Shipping Info</Link> page and at checkout. Payment-provider terms may also apply.</p>
      </Section>

      <Section title="Returns, cancellations and consumer rights">
        <p>Our <Link className="underline" href="/returns">Returns &amp; Refunds</Link> page explains how to contact us. These terms do not limit rights that cannot lawfully be excluded, including rights under South African consumer law.</p>
      </Section>

      <Section title="Digital products">
        <p>Where a product is digital, the product page or checkout must explain delivery, permitted use, any licence restrictions and applicable cancellation or refund conditions before purchase. Product-specific licence terms: <Fill value={null} label="confirm digital product licence terms" />.</p>
      </Section>

      <Section title="Intellectual property and third-party services">
        <p>Store content and branding may not be copied or used commercially without permission, except where the law allows. Payment and other third-party services may be governed by their own terms.</p>
      </Section>

      <Section title="Liability, complaints and governing law">
        <p>Nothing in these terms excludes liability or consumer rights that cannot be excluded under applicable law. Governing law and dispute process: <Fill value={null} label="lawyer to confirm governing-law and dispute clauses" />. Send questions or complaints to <Fill value={SITE.email} label="customer contact email" />.</p>
      </Section>

      <Section title="Updates">
        <p>We may revise these terms by publishing an updated version here. Last updated: <Fill value={null} label="terms approval date" />.</p>
      </Section>
    </InfoPage>
  );
}
