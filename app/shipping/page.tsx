import type { Metadata } from "next";
import Fill from "@/components/Fill";
import InfoPage, { Section } from "@/components/InfoPage";
import { FREE_DELIVERY_OVER } from "@/lib/config";
import { formatRand } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping info | RCW Store",
  description: "Delivery areas, fees and times at RCW Store.",
};

export default function ShippingPage() {
  return (
    <InfoPage
      title="Shipping info"
      intro="Delivery fees and times are shown at checkout, before you pay."
    >
      <Section title="Where we deliver">
        <p>
          <Fill value={SITE.deliveryArea} label="delivery area" />
        </p>
      </Section>

      <Section title="How your order is sent">
        <p>
          Courier: <Fill value={SITE.courier} label="courier" />
        </p>
        <p>
          Time to pack an order:{" "}
          <Fill value={SITE.handlingTime} label="handling time" />
        </p>
        <p>
          Delivery time depends on where you live. The estimate for your
          postcode is shown at checkout.
        </p>
      </Section>

      <Section title="Delivery fees">
        <p>The fee for your postcode is shown at checkout, before you pay.</p>
        <p>Free delivery on orders over {formatRand(FREE_DELIVERY_OVER)}.</p>
      </Section>

      <Section title="Problems with a delivery">
        <p>
          If your order arrives damaged, or does not arrive, please contact
          us as soon as you can. See our contact page for the details.
        </p>
      </Section>
    </InfoPage>
  );
}
