import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sellers } from "./sellers";
import { user } from "./users";

export const PRODUCT_STATUSES = [
  "draft",
  "pending_review",
  "live",
  "rejected",
] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  // Only live categories are shown as shoppable.
  live: boolean("live").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const products = pgTable(
  "products",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    // Whole cents (R549.00 is 54900). The UI shows Rand.
    priceCents: integer("price_cents").notNull(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    subcategory: text("subcategory"),
    // Null means an RCW-owned product, not a marketplace seller's.
    sellerId: text("seller_id").references(() => sellers.id, {
      onDelete: "restrict",
    }),
    isDigital: boolean("is_digital").notNull().default(false),
    trackStock: boolean("track_stock").notNull().default(true),
    stock: integer("stock").notNull().default(0),
    status: text("status", { enum: PRODUCT_STATUSES })
      .notNull()
      .default("draft"),
    rejectionReason: text("rejection_reason"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
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
  (t) => [
    index("products_status_idx").on(t.status),
    index("products_category_idx").on(t.categoryId),
    index("products_seller_idx").on(t.sellerId),
    check("products_price_nonneg", sql`${t.priceCents} >= 0`),
    check("products_stock_nonneg", sql`${t.stock} >= 0`),
    // Maker-checker: whoever created a product cannot approve it.
    check(
      "products_maker_checker",
      sql`${t.reviewedBy} is null or ${t.createdBy} is null or ${t.reviewedBy} <> ${t.createdBy}`
    ),
  ]
);

export const productImages = pgTable(
  "product_images",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("product_images_pos_idx").on(t.productId, t.position)]
);

// Which categories a staff member may work on (category managers, etc.).
// Enforced in catalogue queries in a later step.
export const staffCategoryAccess = pgTable(
  "staff_category_access",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    grantedBy: text("granted_by").references(() => user.id, {
      onDelete: "set null",
    }),
    grantedAt: timestamp("granted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.categoryId] })]
);