import { describe, expect, it } from "vitest";
import { buildOrderDraft, type DbProduct } from "@/lib/checkout/draft";
import { getQuote } from "@/lib/delivery";

const product = (over: Partial<DbProduct> = {}): DbProduct => ({
  id: "id-hoodie",
  slug: "hoodie",
  name: "Hoodie",
  priceCents: 54900,
  isDigital: false,
  trackStock: true,
  stock: 10,
  sellerId: null,
  ...over,
});

const tee = product({ id: "id-tee", slug: "tee", name: "T-Shirt", priceCents: 24900, sellerId: "seller-1" });
const PRETORIA = "0001";

function ok(draft: ReturnType<typeof buildOrderDraft>) {
  if (!draft.ok) throw new Error(`expected ok, got ${draft.error}`);
  return draft;
}

describe("buildOrderDraft: happy path", () => {
  it("prices from the database rows", () => {
    const d = ok(
      buildOrderDraft({
        requested: [{ slug: "tee", quantity: 2 }],
        products: [tee],
        postalCode: PRETORIA,
      })
    );
    expect(d.items).toHaveLength(1);
    expect(d.items[0]).toMatchObject({
      productId: "id-tee",
      sellerId: "seller-1",
      name: "T-Shirt",
      unitPriceCents: 24900,
      quantity: 2,
      lineTotalCents: 49800,
      isDigital: false,
    });
    expect(d.priced.subtotalCents).toBe(49800);
    expect(d.priced.totalCents).toBe(d.priced.subtotalCents + d.priced.deliveryCents);
    expect(d.priced.deliveryCents).toBe(getQuote(PRETORIA)!.fee * 100);
  });

  it("keeps each item line equal to price times quantity (matches the database check)", () => {
    const d = ok(
      buildOrderDraft({
        requested: [
          { slug: "tee", quantity: 3 },
          { slug: "hoodie", quantity: 1 },
        ],
        products: [tee, product()],
        postalCode: PRETORIA,
      })
    );
    for (const i of d.items) {
      expect(i.lineTotalCents).toBe(i.unitPriceCents * i.quantity);
    }
    expect(d.priced.subtotalCents).toBe(d.items.reduce((s, i) => s + i.lineTotalCents, 0));
  });

  it("merges the same product requested twice", () => {
    const d = ok(
      buildOrderDraft({
        requested: [
          { slug: "tee", quantity: 1 },
          { slug: "tee", quantity: 2 },
        ],
        products: [tee],
        postalCode: PRETORIA,
      })
    );
    expect(d.items).toHaveLength(1);
    expect(d.items[0].quantity).toBe(3);
  });

  it("gives free delivery over the threshold", () => {
    const d = ok(
      buildOrderDraft({
        requested: [{ slug: "hoodie", quantity: 1 }],
        products: [product({ priceCents: 60000 })],
        postalCode: PRETORIA,
      })
    );
    expect(d.priced.freeDelivery).toBe(true);
    expect(d.priced.deliveryCents).toBe(0);
  });
});

describe("buildOrderDraft: stock", () => {
  it("allows ordering exactly the stock on hand", () => {
    const r = buildOrderDraft({
      requested: [{ slug: "tee", quantity: 5 }],
      products: [{ ...tee, stock: 5 }],
      postalCode: PRETORIA,
    });
    expect(r.ok).toBe(true);
  });

  it("rejects ordering more than the stock on hand", () => {
    const r = buildOrderDraft({
      requested: [{ slug: "tee", quantity: 6 }],
      products: [{ ...tee, stock: 5 }],
      postalCode: PRETORIA,
    });
    expect(r).toEqual({ ok: false, error: "out_of_stock", slug: "tee" });
  });

  it("checks stock against the merged quantity", () => {
    const r = buildOrderDraft({
      requested: [
        { slug: "tee", quantity: 3 },
        { slug: "tee", quantity: 3 },
      ],
      products: [{ ...tee, stock: 5 }],
      postalCode: PRETORIA,
    });
    expect(r).toEqual({ ok: false, error: "out_of_stock", slug: "tee" });
  });

  it("ignores stock for products that do not track it", () => {
    const r = buildOrderDraft({
      requested: [{ slug: "tee", quantity: 4 }],
      products: [{ ...tee, trackStock: false, stock: 0 }],
      postalCode: PRETORIA,
    });
    expect(r.ok).toBe(true);
  });

  it("rejects a tracked product with no stock", () => {
    const r = buildOrderDraft({
      requested: [{ slug: "tee", quantity: 1 }],
      products: [{ ...tee, stock: 0 }],
      postalCode: PRETORIA,
    });
    expect(r).toEqual({ ok: false, error: "out_of_stock", slug: "tee" });
  });
});

describe("buildOrderDraft: rejections", () => {
  it("rejects an empty request", () => {
    expect(buildOrderDraft({ requested: [], products: [tee], postalCode: PRETORIA })).toEqual({
      ok: false,
      error: "empty_cart",
    });
  });

  it("rejects a product that is not live or does not exist", () => {
    const r = buildOrderDraft({
      requested: [{ slug: "ghost", quantity: 1 }],
      products: [tee],
      postalCode: PRETORIA,
    });
    expect(r).toEqual({ ok: false, error: "no_such_product", slug: "ghost" });
  });

  it("blocks digital products for now", () => {
    const r = buildOrderDraft({
      requested: [{ slug: "kit", quantity: 1 }],
      products: [product({ id: "id-kit", slug: "kit", isDigital: true })],
      postalCode: PRETORIA,
    });
    expect(r).toEqual({ ok: false, error: "digital_not_supported", slug: "kit" });
  });

  it.each([[0], [-1], [1.5], [Number.NaN]])("rejects quantity %s", (quantity) => {
    const r = buildOrderDraft({
      requested: [{ slug: "tee", quantity }],
      products: [tee],
      postalCode: PRETORIA,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("bad_quantity");
  });

  it("rejects more than the per-order limit of one product", () => {
    const r = buildOrderDraft({
      requested: [{ slug: "tee", quantity: 21 }],
      products: [{ ...tee, stock: 100 }],
      postalCode: PRETORIA,
    });
    expect(r).toEqual({ ok: false, error: "bad_quantity" });
  });

  it.each([[""], ["abc"], ["123"], ["12345"]])("rejects postal code %j", (postalCode) => {
    const r = buildOrderDraft({
      requested: [{ slug: "tee", quantity: 1 }],
      products: [tee],
      postalCode,
    });
    expect(r).toEqual({ ok: false, error: "bad_postal_code" });
  });

  it("only uses products it was given, never anything from the browser", () => {
    // The function has no price input at all: the unit price can only come
    // from the product row, whatever the cart in the browser says.
    const d = ok(
      buildOrderDraft({
        requested: [{ slug: "tee", quantity: 1 }],
        products: [{ ...tee, priceCents: 12345 }],
        postalCode: PRETORIA,
      })
    );
    expect(d.items[0].unitPriceCents).toBe(12345);
  });
});
