import {
  priceOrder,
  type CartLine,
  type PricedOrder,
  type PricingError,
} from "@/lib/checkout/pricing";

// Pure: turns "what the customer asked for" plus "what the database says"
// into a priced order draft. No database or network access here.
// The browser only ever supplies slugs and quantities. Prices, names and
// stock come from the product rows the caller loaded from the database.

export type DbProduct = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  isDigital: boolean;
  trackStock: boolean;
  stock: number;
  sellerId: string | null;
};

export type RequestedLine = { slug: string; quantity: number };

export type DraftItem = {
  productId: string;
  sellerId: string | null;
  name: string;
  isDigital: false;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type DraftError =
  | PricingError
  | "no_such_product"
  | "digital_not_supported"
  | "out_of_stock";

export type Draft =
  | { ok: true; priced: PricedOrder; items: DraftItem[] }
  | { ok: false; error: DraftError; slug?: string };

export function buildOrderDraft(input: {
  requested: RequestedLine[];
  products: DbProduct[];
  postalCode: string;
  vatRate?: number | null;
}): Draft {
  const { requested } = input;
  if (requested.length === 0) return { ok: false, error: "empty_cart" };

  for (const r of requested) {
    if (!Number.isInteger(r.quantity) || r.quantity < 1) {
      return { ok: false, error: "bad_quantity", slug: r.slug };
    }
  }

  const bySlug = new Map(input.products.map((p) => [p.slug, p]));

  // Merge repeated slugs so the stock check sees the real total.
  const wanted = new Map<string, number>();
  for (const r of requested) {
    wanted.set(r.slug, (wanted.get(r.slug) ?? 0) + r.quantity);
  }

  const lines: CartLine[] = [];
  const sellerOf = new Map<string, string | null>();

  for (const [slug, quantity] of wanted) {
    const p = bySlug.get(slug);
    if (!p) return { ok: false, error: "no_such_product", slug };
    if (p.isDigital) return { ok: false, error: "digital_not_supported", slug };
    if (p.trackStock && p.stock < quantity) {
      return { ok: false, error: "out_of_stock", slug };
    }
    lines.push({
      productId: p.id,
      name: p.name,
      unitPriceCents: p.priceCents,
      quantity,
    });
    sellerOf.set(p.id, p.sellerId);
  }

  const priced = priceOrder({
    lines,
    postalCode: input.postalCode,
    vatRate: input.vatRate,
  });
  if (!priced.ok) return { ok: false, error: priced.error };

  const items: DraftItem[] = priced.lines.map((l) => ({
    productId: l.productId,
    sellerId: sellerOf.get(l.productId) ?? null,
    name: l.name,
    isDigital: false,
    unitPriceCents: l.unitPriceCents,
    quantity: l.quantity,
    lineTotalCents: l.lineTotalCents,
  }));

  return { ok: true, priced, items };
}
