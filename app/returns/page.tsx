import type { Metadata } from "next";
import Fill from "@/components/Fill";
import InfoPage, { Section } from "@/components/InfoPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Returns and refunds | RCW Store",
  description: "How returns and refunds work at RCW Store.",
};

export default function ReturnsPage() {
  return (
    <InfoPage
      title="Returns and refunds"
      intro="If something is not right with your order, we want to fix it."
    >
      <Section title="Your rights">
        <p>
          South African consumer law, including the Consumer Protection Act and
          the Electronic Communications and Transactions Act, gives you rights
          when you buy online. These can include a cooling-off period on some
          purchases and the right to return goods that are faulty or not as
          described. Nothing on this page takes those rights away.
        </p>
      </Section>

      <Section title="Our return window">
        <p>
          You can return an item within{" "}
          <Fill value={SITE.returnDays} label="return window in days" /> days of
          receiving it.
        </p>
        <p>
          Condition of returned items:{" "}
          <Fill value={SITE.returnConditions} label="return conditions" />
        </p>
      </Section>

      <Section title="How to return an item">
        <p>
          Contact us first with your order number. We will tell you how to send
          the item back.
        </p>
        <p>
          Return address:{" "}
          <Fill value={SITE.returnAddress} label="return address" />
        </p>
      </Section>

      <Section title="Refunds">
        <p>
          Refunds go back to the payment method you used. Once a refund is
          approved it takes{" "}
          <Fill value={SITE.refundTime} label="refund time" />.
        </p>
      </Section>

      <Section title="Digital products">
        <p>
          <Fill value={SITE.digitalRefundPolicy} label="digital product refund policy" />
        </p>
      </Section>
    </InfoPage>
  );
}