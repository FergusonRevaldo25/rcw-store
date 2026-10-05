export const POS_METHODS = ["cash", "card", "eft"] as const;
export type PosMethod = (typeof POS_METHODS)[number];

export const METHOD_LABELS: Record<PosMethod, string> = {
  cash: "Cash",
  card: "Card (machine approved)",
  eft: "EFT",
};

export const MAX_LINES = 50;
export const MAX_QTY = 99;

// PLACEHOLDER: set registered to true ONLY after your accountant confirms
// you are VAT registered. Prices are treated as VAT-inclusive.
export const VAT = { registered: false, ratePercent: 15 };

// PLACEHOLDER: fill these in. A tax invoice needs a VAT number once registered.
export const BUSINESS = {
  name: "RCW Store",
  address: "",
  vatNumber: "",
};

// VAT contained in a VAT-inclusive total.
export function vatOf(totalCents: number) {
  if (!VAT.registered) return 0;
  return Math.round((totalCents * VAT.ratePercent) / (100 + VAT.ratePercent));
}