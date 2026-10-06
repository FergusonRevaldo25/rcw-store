import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { products } from "./catalogue";
import { sellers } from "./sellers";
import { user } from "./users";

export const ORDER_CHANNELS = ["pos", "online"] as const;
export const ORDER_STATUSES = [
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
] as const;
export const POS_SESSION_STATUSES = ["open", "closed"] as const;

export type OrderChannel = (typeof ORDER_CHANNELS)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// A till shift: opened with a float, closed with a counted amount.
export const posSessions = pgTable(
  "pos_sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    till: text("till").notNull().default("Till 1"),
    status: text("status", { enum: POS_SESSION_STATUSES })
      .notNull()
      .default("open"),
    openedBy: text("opened_by").references(() => user.id, {
      onDelete: "set null",
    }),
    closedBy: text("closed_by").references(() => user.id, {
      onDelete: "set null",
    }),
    openingFloatCents: integer("opening_float_cents").notNull().default(0),
    // Filled in when the till is closed.
    expectedCashCents: integer("expected_cash_cents"),
    countedCashCents: integer("counted_cash_cents"),
    note: text("note"),
    openedAt: timestamp("opened_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (t) => [
    index("pos_sessions_status_idx").on(t.status),
    // One open session per cashier at a time.
    uniqueIndex("pos_sessions_one_open_idx")
      .on(t.openedBy)
      .where(sql`${t.status} = 'open'`),
    check("pos_sessions_float_nonneg", sql`${t.openingFloatCents} >= 0`),
    check(
      "pos_sessions_counted_nonneg",
      sql`${t.countedCashCents} is null or ${t.countedCashCents} >= 0`
    ),
    check(
      "pos_sessions_closed_has_time",
      sql`${t.status} = 'open' or ${t.closedAt} is not null`
    ),
  ]
);

export const orders = pgTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // Human-friendly order number, starting at 1000.
    number: integer("number")
      .notNull()
      .generatedAlwaysAsIdentity({ startWith: 1000 }),
    channel: text("channel", { enum: ORDER_CHANNELS }).notNull(),
    status: text("status", { enum: ORDER_STATUSES })
      .notNull()
      .default("pending"),
    customerId: text("customer_id").references(() => user.id, {
      onDelete: "set null",
    }),
    // Snapshots, so walk-in and guest orders work and history survives.
    customerName: text("customer_name"),
    customerEmail: text("customer_email"),
    cashierId: text("cashier_id").references(() => user.id, {
      onDelete: "set null",
    }),
    posSessionId: text("pos_session_id").references(() => posSessions.id, {
      onDelete: "restrict",
    }),
    currency: text("currency").notNull().default("ZAR"),
    // All amounts are whole cents.
    subtotalCents: integer("subtotal_cents").notNull(),
    discountCents: integer("discount_cents").notNull().default(0),
    vatCents: integer("vat_cents").notNull().default(0),
    // True: vatCents is already inside the total. False: it is added on top.
    vatIncluded: boolean("vat_included").notNull().default(true),
    // Online orders: delivery is added to the subtotal.
    deliveryCents: integer("delivery_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    note: text("note"),
    // Online orders only. Till orders leave these empty.
    // A long random code, so a guest can open their own order without an account.
    publicToken: text("public_token").unique(),
    shippingName: text("shipping_name"),
    shippingPhone: text("shipping_phone"),
    shippingAddress1: text("shipping_address1"),
    shippingAddress2: text("shipping_address2"),
    shippingSuburb: text("shipping_suburb"),
    shippingCity: text("shipping_city"),
    shippingProvince: text("shipping_province"),
    shippingPostalCode: text("shipping_postal_code"),
    trackingRef: text("tracking_ref"),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("orders_number_idx").on(t.number),
    index("orders_status_idx").on(t.status),
    index("orders_channel_created_idx").on(t.channel, t.createdAt),
    index("orders_customer_idx").on(t.customerId),
    index("orders_session_idx").on(t.posSessionId),
    check("orders_subtotal_nonneg", sql`${t.subtotalCents} >= 0`),
    check(
      "orders_discount_valid",
      sql`${t.discountCents} >= 0 and ${t.discountCents} <= ${t.subtotalCents}`
    ),
    check("orders_vat_nonneg", sql`${t.vatCents} >= 0`),
    check("orders_delivery_nonneg", sql`${t.deliveryCents} >= 0`),
    check("orders_total_nonneg", sql`${t.totalCents} >= 0`),
    check(
      "orders_pos_has_session",
      sql`${t.channel} <> 'pos' or ${t.posSessionId} is not null`
    ),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    sellerId: text("seller_id").references(() => sellers.id, {
      onDelete: "set null",
    }),
    // Copied at the time of sale. Never read these from the product later.
    name: text("name").notNull(),
    isDigital: boolean("is_digital").notNull().default(false),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotalCents: integer("line_total_cents").notNull(),
  },
  (t) => [
    index("order_items_order_idx").on(t.orderId),
    index("order_items_product_idx").on(t.productId),
    check("order_items_qty_positive", sql`${t.quantity} > 0`),
    check("order_items_price_nonneg", sql`${t.unitPriceCents} >= 0`),
    check(
      "order_items_line_matches",
      sql`${t.lineTotalCents} = ${t.unitPriceCents} * ${t.quantity}`
    ),
  ]
);