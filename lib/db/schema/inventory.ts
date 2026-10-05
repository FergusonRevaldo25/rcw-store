import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { products } from "./catalogue";
import { orders } from "./orders";
import { user } from "./users";

export const STOCK_REASONS = [
  "sale",
  "refund",
  "restock",
  "adjustment",
  "count",
] as const;
export type StockReason = (typeof STOCK_REASONS)[number];

// Every stock change is a row. products.stock is the running total;
// this table is the trail that explains it.
export const stockMovements = pgTable(
  "stock_movements",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    // Negative removes stock (a sale), positive adds it.
    delta: integer("delta").notNull(),
    reason: text("reason", { enum: STOCK_REASONS }).notNull(),
    orderId: text("order_id").references(() => orders.id, {
      onDelete: "restrict",
    }),
    note: text("note"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("stock_movements_product_idx").on(t.productId, t.createdAt),
    index("stock_movements_order_idx").on(t.orderId),
    check("stock_movements_nonzero", sql`${t.delta} <> 0`),
  ]
);