export type TrustItem = {
  id: string;
  title: string;
  text: string;
  icon: "shield" | "returns" | "truck" | "pin";
  // Only set to true once you can really keep the promise.
  // Unconfirmed items show with a "Placeholder" tag in development
  // and are hidden completely in production.
  confirmed: boolean;
};

export const TRUST_ITEMS: TrustItem[] = [
  {
    id: "payments",
    title: "Secure payments",
    text: "Pay with trusted South African payment options.",
    icon: "shield",
    confirmed: false, // PLACEHOLDER: depends on the provider you sign up with
  },
  {
    id: "returns",
    title: "Simple returns",
    text: "Easy returns on eligible items.",
    icon: "returns",
    confirmed: false, // PLACEHOLDER: write your real return policy first
  },
  {
    id: "delivery",
    title: "Delivery across South Africa",
    text: "Rates and times shown before you pay.",
    icon: "truck",
    confirmed: false, // PLACEHOLDER: needs real zones and fees in lib/delivery.ts
  },
  {
    id: "local",
    title: "Proudly South African",
    text: "A local store with local prices.",
    icon: "pin",
    confirmed: true,
  },
];
