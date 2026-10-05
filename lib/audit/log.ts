import type { db } from "@/lib/db";

// The transaction object passed to db.transaction(async (tx) => ...)
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Usage: await tx.insert(auditLog).values(auditValues(user, "staff.add", "user", id, before, after))
export function auditValues(
  actor: { id: string; email: string },
  action: string,
  entityType: string,
  entityId: string,
  before?: unknown,
  after?: unknown
) {
  return {
    actorId: actor.id,
    actorLabel: actor.email,
    action,
    entityType,
    entityId,
    before: before ?? null,
    after: after ?? null,
  };
}