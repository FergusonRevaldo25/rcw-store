import type { Metadata } from "next";
import { Section } from "@/components/InfoPage";
import LegalPage, { bullets } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cookie policy | RCW Store",
  description: "What RCW Store saves in your browser and why.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie policy"
      intro="This page explains what RCW Store saves in your browser. We keep it to what the store needs to work."
    >
      <Section title="What we save">
        <ul className={bullets}>
          <li>
            <strong>Sign-in session (cookie):</strong> keeps you signed in for
            up to 7 days. Needed for your account to work.
          </li>
          <li>
            <strong>Cart (browser storage):</strong> remembers what is in your
            cart. Needed for the cart to work.
          </li>
          <li>
            <strong>Favourites and recently viewed (browser storage):</strong>{" "}
            remembers the products you saved or looked at, for your convenience.
          </li>
          <li>
            <strong>Theme (browser storage):</strong> remembers your light or
            dark choice.
          </li>
        </ul>
      </Section>

      <Section title="What we do not use">
        <p>
          We do not currently use advertising cookies or analytics tools. If
          that changes, we will update this page and ask for your consent where
          the law requires it.
        </p>
      </Section>

      <Section title="Other websites">
        <p>
          When you pay, our payment provider&apos;s own page opens. It may save
          its own cookies. Please see its policy for details.
        </p>
      </Section>

      <Section title="Controlling what is saved">
        <p>
          You can delete or block cookies and site data in your browser
          settings. If you do, you will be signed out and your cart, favourites
          and theme choice will be cleared.
        </p>
      </Section>
    </LegalPage>
  );
}