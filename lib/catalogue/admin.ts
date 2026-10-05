import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, roles, userRoles } from "@/lib/db/schema";
import { categoryScope } from "./queries";

export function slugify(s: string) {
  const base = s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
  return `${base || "product"}-${crypto.randomUUID().slice(0, 6)}`;
}

export function inScope(visible: "all" | string[], categoryId: string) {
  return visible === "all" || visible.includes(categoryId);
}

export async function isSuperAdmin(userId: string) {
  const rows = await db
    .select({ key: roles.key })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(and(eq(userRoles.userId, userId), eq(roles.key, "super_admin")))
    .limit(1);
  return rows.length > 0;
}

// Every category the staff member may work in, live or not.
export async function listAllowedCategories(visible: "all" | string[]) {
  return db
    .select({ id: categories.id, name: categories.name, live: categories.live })
    .from(categories)
    .where(categoryScope(categories.id, visible))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}