import type { Metadata } from "next";
import Fill from "@/components/Fill";
import InfoPage, { Section } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Cookie Policy | RCW Store",
  description: "How RCW Store uses cookies and similar browser storage.",
};

const review = "mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-[var(--text)]";

export default function CookiesPage() {
  return (
    <InfoPage title="Cookie Policy" intro="This draft describes browser storage used to make the store work and preferences remembered by your browser.">
      <p className={review}>Confirm this inventory against the production site, enabled analytics and consent tooling before launch. Add a consent banner if any non-essential cookies or similar technologies are enabled.</p>

      <Section title="What cookies and local storage do">
        <p>Cookies are small values stored by your browser and sent with requests. Similar technologies, including local storage, can keep information in your browser without sending it on every request.</p>
      </Section>

      <Section title="Strictly necessary storage">
        <p>Authentication and security features use cookies to maintain sign-in sessions and protect sensitive admin actions. The store also uses local storage in your browser to remember your cart and favourites. These functions support features you request.</p>
      </Section>

      <Section title="Analytics and advertising">
        <p>Analytics, advertising and other non-essential tracking: <Fill value={null} label="confirm enabled services, purposes, vendors and consent controls—or state none are used" />. This draft does not claim that optional tracking is or is not active.</p>
      </Section>

      <Section title="Managing your settings">
        <p>You can clear or block cookies and local storage through your browser settings. Blocking necessary storage may stop sign-in, cart or other store functions from working. Where required, we will ask for your choices before storing or accessing non-essential technologies.</p>
      </Section>

      <Section title="Changes and contact">
        <p>We will update this policy if our storage practices change. Questions: <Fill value={null} label="privacy contact email" />. Last updated: <Fill value={null} label="policy approval date" />.</p>
      </Section>
    </InfoPage>
  );
}
