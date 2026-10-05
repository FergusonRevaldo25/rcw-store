import type { Metadata } from "next";
import Link from "next/link";
import InfoPage, { Section } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | RCW Store",
  description: "Answers to common questions about shopping with RCW Store.",
};

const link = "underline underline-offset-2";

export default function FAQPage() {
  return (
    <InfoPage title="Frequently Asked Questions" intro="Quick answers about shopping with RCW Store. We’ll add order and payment guidance as checkout becomes available.">
      <Section title="What can I buy from RCW Store?">
        <p>We currently list clothing and digital products. New categories appear as products become available.</p>
      </Section>

      <Section title="How do I place an order?">
        <p>Online checkout is being prepared. Product availability and checkout instructions will be shown on the store as the ordering flow becomes available.</p>
      </Section>

      <Section title="Which payment methods can I use?">
        <p>Payment options will be confirmed at checkout. Do not send card or banking details to us by email or message.</p>
      </Section>

      <Section title="How much does delivery cost, and how long does it take?">
        <p>Delivery coverage, fees and timing are being confirmed. Check our <Link className={link} href="/shipping">Shipping Info</Link> page and the checkout details before placing an order.</p>
      </Section>

      <Section title="Can I return or get a refund for an item?">
        <p>See <Link className={link} href="/returns">Returns &amp; Refunds</Link>. Your rights under applicable consumer law are not limited by store policies.</p>
      </Section>

      <Section title="How do I check an order?">
        <p>Order tracking instructions will be provided when online order fulfilment is available. For help with an existing order, contact us and include your order number.</p>
      </Section>

      <Section title="How do I contact RCW Store?">
        <p>Use the details on our <Link className={link} href="/contact">Contact Us</Link> page. Include your order number if your question relates to an order.</p>
      </Section>
    </InfoPage>
  );
}
