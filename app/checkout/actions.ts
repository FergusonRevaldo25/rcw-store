"use server";

import { randomBytes } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { buildOrderDraft, type RequestedLine } from "@/lib/checkout/draft";
import type { PlaceOrderResult } from "@/lib/checkout/types";
import { validateCheckoutForm } from "@/lib/checkout/validation";
import { db } from "@/lib/db";
import { categories, orderItems, orders, products } from "@/lib/db/schema";

const MAX_LINES = 50;

// Creates a PENDING online order. It does not take payment and does not
// reduce stock: both happen when payment is confirmed (PayFast, later).
// The browser sends only slugs, quantities and the delivery form.
export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  if (process.env.CHECKOUT_ENABLED !== "true") {
    return { ok: false, error: "disabled" };
  }

  const body = (input && typeof input === "object" ? input : {}) as {
    lines?: unknown;
    form?: unknown;
  };

  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return { ok: false, error: "empty_cart" };
  }
  if (body.lines.length > MAX_LINES) {
    return { ok: false, error: "bad_quantity" };
  }

  const requested: RequestedLine[] = body.lines.map((l) => {
    const o = (l && typeof l === "object" ? l : {}) as {
      slug?: unknown;
      quantity?: unknown;
    };
    return {
      slug: typeof o.slug === "string" ? o.slug.slice(0, 120) : "",
      quantity: typeof o.quantity === "number" ? o.quantity : Number.NaN,
    };
  });

  const form = validateCheckoutForm(body.form);
  if (!form.ok) {
    return { ok: false, error: "invalid_form", fieldErrors: form.errors };
  }
  const f = form.value;

  const slugs = [...new Set(requested.map((r) => r.slug).filter(Boolean))];
  const rows = slugs.length
    ? await db
        .select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          priceCents: products.priceCents,
          isDigital: products.isDigital,
          trackStock: products.trackStock,
          stock: products.stock,
          sellerId: products.sellerId,
        })
        .from(products)
        .innerJoin(categories, eq(categories.id, products.categoryId))
        .where(
          and(
            eq(products.status, "live"),
            eq(categories.live, true),
            inArray(products.slug, slugs)
          )
        )
    : [];

  // VAT status is not decided yet, so no VAT rate is applied.
  const draft = buildOrderDraft({
    requested,
    products: rows,
    postalCode: f.postalCode,
    vatRate: null,
  });
  if (!draft.ok) return { ok: false, error: draft.error, slug: draft.slug };

  const p = draft.priced;
  const session = await getSession();
  const token = randomBytes(32).toString("base64url");

  try {
    const order = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(orders)
        .values({
          channel: "online",
          status: "pending",
          customerId: session?.user.id ?? null,
          customerName: f.name,
          customerEmail: f.email,
          subtotalCents: p.subtotalCents,
          discountCents: 0,
          vatCents: p.vatCents,
          vatIncluded: true,
          deliveryCents: p.deliveryCents,
          totalCents: p.totalCents,
          note: f.note || null,
          publicToken: token,
          shippingName: f.name,
          shippingPhone: f.phone,
          shippingAddress1: f.address1,
          shippingAddress2: f.address2 || null,
          shippingSuburb: f.suburb,
          shippingCity: f.city,
          shippingProvince: f.province,
          shippingPostalCode: f.postalCode,
        })
        .returning({ id: orders.id, number: orders.number });

      await tx
        .insert(orderItems)
        .values(draft.items.map((i) => ({ orderId: row.id, ...i })));

      return row;
    });

    return { ok: true, token, number: order.number };
  } catch {
    return { ok: false, error: "server" };
  }
}
