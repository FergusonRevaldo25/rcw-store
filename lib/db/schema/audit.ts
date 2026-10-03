import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Append-only. A database trigger (see docs in the steps) blocks UPDATE and DELETE.
// actor_id is deliberately NOT a foreign key, so history survives user deletion.
// NEVER put passwords, tokens or full card data in before/after.
export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    actorId: text("actor_id"),
    actorLabel: text("actor_label"), // email at the time of the action
    action: text("action").notNull(), // e.g. "role.permission.grant"
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    before: jsonb("before"),
    after: jsonb("after"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("audit_actor_idx").on(t.actorId),
    index("audit_entity_idx").on(t.entityType, t.entityId),
    index("audit_created_idx").on(t.createdAt),
  ]
);
