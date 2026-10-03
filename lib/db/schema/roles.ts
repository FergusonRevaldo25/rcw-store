import {
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./users";

export const roles = pgTable("roles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  // Built-in roles can be edited but not deleted.
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Seeded from lib/rbac/permissions.ts
export const permissions = pgTable("permissions", {
  key: text("key").primaryKey(), // e.g. "orders:view"
  module: text("module").notNull(),
  action: text("action").notNull(),
  description: text("description"),
  // Sensitive actions need a fresh two-factor check.
  sensitive: boolean("sensitive").notNull().default(false),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionKey: text("permission_key")
      .notNull()
      .references(() => permissions.key, { onDelete: "cascade" }),
    scope: text("scope", { enum: ["all", "own"] })
      .notNull()
      .default("all"),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionKey] })]
);

export const userRoles = pgTable(
  "user_roles",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    grantedBy: text("granted_by").references(() => user.id, {
      onDelete: "set null",
    }),
    grantedAt: timestamp("granted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.roleId] }),
    index("user_roles_user_idx").on(t.userId),
  ]
);

export const staffInvites = pgTable(
  "staff_invites",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull(),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    // Store only a hash of the token. The raw token is emailed once.
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    invitedBy: text("invited_by").references(() => user.id, {
      onDelete: "set null",
    }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("staff_invites_email_idx").on(t.email)]
);
