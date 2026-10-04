import { and, eq, inArray } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import {
  categories,
  roles,
  staffCategoryAccess,
  userRoles,
} from "@/lib/db/schema";

// Categories a staff member may see and work on.
// Admin and Super Admin: all. Everyone else: only their granted categories.
// A staff member with no grants sees nothing (safe by default).
export async function getVisibleCategoryIds(
  userId: string,
): Promise<"all" | string[]> {
  const held = await db
    .select({ key: roles.key })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(eq(userRoles.userId, userId));

  if (held.some((r) => r.key === "super_admin" || r.key === "admin")) {
    return "all";
  }

  const rows = await db
    .select({ id: staffCategoryAccess.categoryId })
    .from(staffCategoryAccess)
    .where(eq(staffCategoryAccess.userId, userId));
  return rows.map((r) => r.id);
}

// Use in admin product queries: where(categoryScope(products.categoryId, visible))
// Returns undefined for "all", which Drizzle ignores inside and(...).
export function categoryScope(column: PgColumn, visible: "all" | string[]) {
  if (visible === "all") return undefined;
  // An empty grant list must match nothing.
  return inArray(column, visible.length ? visible : ["__none__"]);
}

export async function listLiveCategories() {
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(and(eq(categories.live, true)))
    .orderBy(categories.sortOrder);
}
