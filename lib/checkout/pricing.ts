import { FREE_DELIVERY_OVER } from "@/lib/config";
import { getQuote } from "@/lib/delivery";

// Pure pricing for an online order. No database, no network.
// The caller loads each product's price FROM THE DATABASE (never from the
// browser) and passes it in as whole cents.
//
// Units: everything here is whole cents. Config and delivery fees are in rand,
// and are converted in exactly one place below (toCents).

export const MAX_QTY = 20;

export type CartLine = {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
};

export type PricedLine = CartLine & { lineTotalCents: number };

export type PricingError =
  | "empty_cart"
  | "bad_quantity"
  | "bad_price"
  | "bad_postal_code";

export type PricedOrder = {
  ok: true;
  lines: PricedLine[];
  subtotalCents: number;
  deliveryCents: number;
  deliveryArea: string;
  deliveryDays: string;
  freeDelivery: boolean;
  // Prices are assumed to include VAT. 0 when no vatRate is given.
  vatCents: number;
  totalCents: number;
};

export type PricingResult = PricedOrder | { ok: false; error: PricingError };

const toCents = (rand: number) => Math.round(rand * 100);

// VAT contained in a VAT-inclusive amount, e.g. rate 0.15.
export function vatIncludedIn(totalCents: number, rate: number): number {
  if (!(rate > 0 && rate < 1)) throw new Error("vatRate must be between 0 and 1");
  return Math.round((totalCents * rate) / (1 + rate));
}

export function priceOrder(input: {
  lines: CartLine[];
  postalCode: string;
  vatRate?: number | null;
}): PricingResult {
  if (input.lines.length === 0) return { ok: false, error: "empty_cart" };

  // Merge repeated products so the quantity limit applies to the total.
  const merged = new Map<string, CartLine>();
  for (const line of input.lines) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      return { ok: false, error: "bad_quantity" };
    }
    if (!Number.isInteger(line.unitPriceCents) || line.unitPriceCents < 0) {
      return { ok: false, error: "bad_price" };
    }
    const seen = merged.get(line.productId);
    if (seen) {
      merged.set(line.productId, { ...seen, quantity: seen.quantity + line.quantity });
    } else {
      merged.set(line.productId, { ...line });
    }
  }

  const lines: PricedLine[] = [];
  for (const line of merged.values()) {
    if (line.quantity > MAX_QTY) return { ok: false, error: "bad_quantity" };
    lines.push({ ...line, lineTotalCents: line.unitPriceCents * line.quantity });
  }

  const quote = getQuote(input.postalCode.trim());
  if (!quote) return { ok: false, error: "bad_postal_code" };

  const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);

  // "Free delivery over R500" means strictly more than R500.00.
  const freeDelivery = subtotalCents > toCents(FREE_DELIVERY_OVER);
  const deliveryCents = freeDelivery ? 0 : toCents(quote.fee);

  const totalCents = subtotalCents + deliveryCents;
  const vatCents = input.vatRate ? vatIncludedIn(totalCents, input.vatRate) : 0;

  return {
    ok: true,
    lines,
    subtotalCents,
    deliveryCents,
    deliveryArea: quote.area,
    deliveryDays: quote.days,
    freeDelivery,
    vatCents,
    totalCents,
  };
}
