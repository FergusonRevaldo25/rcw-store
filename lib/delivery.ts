import { FREE_DELIVERY_OVER } from "@/lib/config";

export type Quote = { area: string; days: string; fee: number };

// PLACEHOLDER ranges, times and fees. Replace with your courier's real rates.
const zones: { from: number; to: number; quote: Quote }[] = [
  {
    from: 1,
    to: 299,
    quote: { area: "Pretoria", days: "2 to 3 working days", fee: 60 },
  },
  {
    from: 1400,
    to: 2199,
    quote: { area: "Johannesburg", days: "2 to 3 working days", fee: 60 },
  },
  {
    from: 4000,
    to: 4099,
    quote: { area: "Durban", days: "3 to 4 working days", fee: 70 },
  },
  {
    from: 7100,
    to: 8099,
    quote: { area: "Cape Town", days: "3 to 4 working days", fee: 70 },
  },
];

const rest: Quote = {
  area: "the rest of South Africa",
  days: "4 to 7 working days",
  fee: 99,
};

export function getQuote(code: string): Quote | null {
  if (!/^\d{4}$/.test(code)) return null;
  const n = Number(code);
  return zones.find((z) => n >= z.from && n <= z.to)?.quote ?? rest;
}

export const freeOver = FREE_DELIVERY_OVER;
