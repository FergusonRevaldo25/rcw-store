import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { orders, posSessions } from "./orders";
import { user } from "./users";

export const PAYMENT_METHODS = [
  "cash",
  "card",
  "eft",
  "payfast",
  "ozow",
] as const;
export const PAYMENT_STATUSES = [
  "pending",
  "succeeded",
  "failed",
  "cancelled",
] as const;
export const REFUND_STATUSES = [
  "requested",
  "approved",
  "rejected",
  "paid",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const payments = pgTable(
  "payments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // Financial records are never deleted by cascade.
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    method: text("method", { enum: PAYMENT_METHODS }).notNull(),
    status: text("status", { enum: PAYMENT_STATUSES })
      .notNull()
      .default("pending"),
    amountCents: integer("amount_cents").notNull(),
    // Gateway or card-slip reference. Unique per method so a repeated
    // webhook can never be counted twice.
    providerRef: text("provider_ref"),
    recordedBy: text("recorded_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  },
  (t) => [
    index("payments_order_idx").on(t.orderId),
    index("payments_status_idx").on(t.status),
    uniqueIndex("payments_provider_ref_idx")
      .on(t.method, t.providerRef)
      .where(sql`${t.providerRef} is not null`),
    check("payments_amount_positive", sql`${t.amountCents} > 0`),
  ]
);

export const refunds = pgTable(
  "refunds",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    paymentId: text("payment_id").references(() => payments.id, {
      onDelete: "restrict",
    }),
    amountCents: integer("amount_cents").notNull(),
    reason: text("reason").notNull(),
    status: text("status", { enum: REFUND_STATUSES })
      .notNull()
      .default("requested"),
    requestedBy: text("requested_by").references(() => user.id, {
      onDelete: "set null",
    }),
    decidedBy: text("decided_by").references(() => user.id, {
      onDelete: "set null",
    }),
    decisionNote: text("decision_note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    // The till that handed out or reversed the money. Set when status becomes "paid".
    posSessionId: text("pos_session_id").references(() => posSessions.id, {
      onDelete: "restrict",
    }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (t) => [
    index("refunds_order_idx").on(t.orderId),
    index("refunds_status_idx").on(t.status),
    index("refunds_session_idx").on(t.posSessionId),
    check("refunds_amount_positive", sql`${t.amountCents} > 0`),
    // Maker-checker: the person who requests a refund cannot decide it.
    check(
      "refunds_maker_checker",
      sql`${t.decidedBy} is null or ${t.requestedBy} is null or ${t.decidedBy} <> ${t.requestedBy}`
    ),
  ]
);