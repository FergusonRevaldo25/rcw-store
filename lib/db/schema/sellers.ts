import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./users";

export const SELLER_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "suspended",
] as const;
export type SellerStatus = (typeof SELLER_STATUSES)[number];

export const sellers = pgTable(
  "sellers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // One seller profile per user.
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    businessName: text("business_name").notNull(),
    contactPhone: text("contact_phone").notNull(),
    category: text("category").notNull(), // what they sell
    description: text("description").notNull(),
    status: text("status", { enum: SELLER_STATUSES })
      .notNull()
      .default("pending"),
    rejectionReason: text("rejection_reason"),
    // POPIA: record when and that they accepted the seller terms.
    termsAcceptedAt: timestamp("terms_accepted_at", {
      withTimezone: true,
    }).notNull(),
    reviewedBy: text("reviewed_by").references(() => user.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sellers_status_idx").on(t.status)]
);