import { describe, expect, it } from "vitest";
import { FREE_DELIVERY_OVER } from "@/lib/config";
import { getQuote } from "@/lib/delivery";
import {
  MAX_QTY,
  priceOrder,
  vatIncludedIn,
  type CartLine,
} from "@/lib/checkout/pricing";

const line = (over: Partial<CartLine> = {}): CartLine => ({
  productId: "p1",
  name: "Test product",
  unitPriceCents: 24900,
  quantity: 1,
  ...over,
});

const PRETORIA = "0001";
const REST = "9999";
const FREE_OVER_CENTS = FREE_DELIVERY_OVER * 100;

function ok(result: ReturnType<typeof priceOrder>) {
  if (!result.ok) throw new Error(`expected ok, got ${result.error}`);
  return result;
}

describe("priceOrder: totals", () => {
  it("adds delivery to a small order", () => {
    const r = ok(priceOrder({ lines: [line()], postalCode: PRETORIA }));
    expect(r.subtotalCents).toBe(24900);
    expect(r.deliveryCents).toBe(getQuote(PRETORIA)!.fee * 100);
    expect(r.totalCents).toBe(r.subtotalCents + r.deliveryCents);
    expect(r.freeDelivery).toBe(false);
    expect(r.deliveryArea).toBe("Pretoria");
  });

  it("converts the delivery fee from rand to cents", () => {
    const r = ok(priceOrder({ lines: [line()], postalCode: REST }));
    expect(r.deliveryCents).toBe(getQuote(REST)!.fee * 100);
    expect(r.deliveryCents).toBeGreaterThanOrEqual(100); // not R0.99 by mistake
  });

  it("multiplies price by quantity and sums the lines", () => {
    const r = ok(
      priceOrder({
        lines: [
          line({ productId: "a", unitPriceCents: 14900, quantity: 2 }),
          line({ productId: "b", unitPriceCents: 19900, quantity: 1 }),
        ],
        postalCode: PRETORIA,
      })
    );
    expect(r.lines.map((l) => l.lineTotalCents)).toEqual([29800, 19900]);
    expect(r.subtotalCents).toBe(49700);
  });

  it("merges repeated products into one line", () => {
    const r = ok(
      priceOrder({
        lines: [
          line({ productId: "a", unitPriceCents: 1000, quantity: 2 }),
          line({ productId: "a", unitPriceCents: 1000, quantity: 3 }),
        ],
        postalCode: PRETORIA,
      })
    );
    expect(r.lines).toHaveLength(1);
    expect(r.lines[0].quantity).toBe(5);
    expect(r.lines[0].lineTotalCents).toBe(5000);
  });

  it("keeps every line equal to unit price times quantity (matches the database check)", () => {
    for (const qty of [1, 2, 7, MAX_QTY]) {
      for (const price of [0, 1, 99, 24999]) {
        const r = ok(
          priceOrder({ lines: [line({ unitPriceCents: price, quantity: qty })], postalCode: PRETORIA })
        );
        expect(r.lines[0].lineTotalCents).toBe(price * qty);
        expect(r.totalCents).toBe(r.subtotalCents + r.deliveryCents);
      }
    }
  });

  it("accepts a postal code with surrounding spaces", () => {
    const r = ok(priceOrder({ lines: [line()], postalCode: " 1400 " }));
    expect(r.deliveryArea).toBe("Johannesburg");
  });
});

describe("priceOrder: free delivery", () => {
  it("charges delivery at exactly the threshold", () => {
    const r = ok(
      priceOrder({ lines: [line({ unitPriceCents: FREE_OVER_CENTS })], postalCode: PRETORIA })
    );
    expect(r.freeDelivery).toBe(false);
    expect(r.deliveryCents).toBeGreaterThan(0);
  });

  it("makes delivery free one cent over the threshold", () => {
    const r = ok(
      priceOrder({ lines: [line({ unitPriceCents: FREE_OVER_CENTS + 1 })], postalCode: PRETORIA })
    );
    expect(r.freeDelivery).toBe(true);
    expect(r.deliveryCents).toBe(0);
    expect(r.totalCents).toBe(r.subtotalCents);
  });

  it("charges delivery one cent under the threshold", () => {
    const r = ok(
      priceOrder({ lines: [line({ unitPriceCents: FREE_OVER_CENTS - 1 })], postalCode: REST })
    );
    expect(r.freeDelivery).toBe(false);
  });
});

describe("priceOrder: VAT (prices include VAT)", () => {
  it("returns no VAT when no rate is given", () => {
    const r = ok(priceOrder({ lines: [line()], postalCode: PRETORIA }));
    expect(r.vatCents).toBe(0);
  });

  it("takes VAT out of the total without changing the total", () => {
    // R1,150.00 order, free delivery, 15% VAT: VAT is exactly R150.00
    const r = ok(
      priceOrder({ lines: [line({ unitPriceCents: 115000 })], postalCode: PRETORIA, vatRate: 0.15 })
    );
    expect(r.totalCents).toBe(115000);
    expect(r.vatCents).toBe(15000);
  });

  it("rounds VAT to the nearest cent", () => {
    expect(vatIncludedIn(16000, 0.15)).toBe(Math.round((16000 * 15) / 115));
    expect(Number.isInteger(vatIncludedIn(12345, 0.15))).toBe(true);
  });

  it.each([[0], [1], [-0.1], [15]])("rejects an invalid VAT rate of %s", (rate) => {
    expect(() => vatIncludedIn(1000, rate)).toThrow();
  });
});

describe("priceOrder: rejects bad input", () => {
  it("rejects an empty cart", () => {
    expect(priceOrder({ lines: [], postalCode: PRETORIA })).toEqual({ ok: false, error: "empty_cart" });
  });

  it.each([[0], [-1], [1.5], [Number.NaN], [Number.POSITIVE_INFINITY], [MAX_QTY + 1]])(
    "rejects quantity %s",
    (quantity) => {
      const r = priceOrder({ lines: [line({ quantity })], postalCode: PRETORIA });
      expect(r).toEqual({ ok: false, error: "bad_quantity" });
    }
  );

  it("applies the quantity limit to the merged total", () => {
    const r = priceOrder({
      lines: [line({ quantity: 12 }), line({ quantity: 12 })],
      postalCode: PRETORIA,
    });
    expect(r).toEqual({ ok: false, error: "bad_quantity" });
  });

  it("allows exactly the maximum quantity", () => {
    expect(priceOrder({ lines: [line({ quantity: MAX_QTY })], postalCode: PRETORIA }).ok).toBe(true);
  });

  it.each([[-1], [1.5], [Number.NaN]])("rejects unit price %s", (unitPriceCents) => {
    const r = priceOrder({ lines: [line({ unitPriceCents })], postalCode: PRETORIA });
    expect(r).toEqual({ ok: false, error: "bad_price" });
  });

  it.each([[""], ["abc"], ["123"], ["12345"], ["14 00"]])("rejects postal code %j", (postalCode) => {
    expect(priceOrder({ lines: [line()], postalCode })).toEqual({ ok: false, error: "bad_postal_code" });
  });
});
