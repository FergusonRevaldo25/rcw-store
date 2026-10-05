import type { Metadata } from "next";
import Link from "next/link";
import InfoPage, { Section } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "About RCW Store | RCW Store",
  description:
    "RCW Store is a South African online store: great deals and cheap prices, proudly South African.",
};

const link =
  "rounded text-[var(--text)] underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function AboutPage() {
  return (
    <InfoPage title="About RCW Store">
      <Section title="Who we are">
        <p>
          RCW Store is a South African online store built around one idea:
          great deals and cheap prices, proudly South African.
        </p>
      </Section>

      <Section title="What we sell">
        <p>
          Today that means clothes and digital products. We are opening new
          categories one at a time, and each one goes live once it has
          products on the shelf.
        </p>
      </Section>

      <Section title="Sell with us">
        <p>
          If you make or sell something South Africans would love, you can
          apply to sell on RCW Store.{" "}
          <Link href="/partner" className={link}>
            See how to become a partner
          </Link>
          .
        </p>
      </Section>

      <Section title="Get in touch">
        <p>
          Questions about an order or a product? Our{" "}
          <Link href="/contact" className={link}>
            contact page
          </Link>{" "}
          has the details.
        </p>
      </Section>
    </InfoPage>
  );
}