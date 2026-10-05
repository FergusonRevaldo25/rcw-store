import { and, count, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { rolePermissions, roles, user, userRoles } from "@/lib/db/schema";

export async function permissionsOfUser(userId: string) {
  const rows = await db
    .selectDistinct({ key: rolePermissions.permissionKey })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
    .where(eq(userRoles.userId, userId));
  return rows.map((r) => r.key);
}

export async function permissionsOfRole(roleId: string) {
  const rows = await db
    .select({ key: rolePermissions.permissionKey })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId));
  return rows.map((r) => r.key);
}

export async function rolePermissionMap() {
  const rows = await db
    .select({ roleId: rolePermissions.roleId, key: rolePermissions.permissionKey })
    .from(rolePermissions);
  const map = new Map<string, string[]>();
  for (const r of rows) map.set(r.roleId, [...(map.get(r.roleId) ?? []), r.key]);
  return map;
}

export async function roleKeysOf(userId: string) {
  const rows = await db
    .select({ key: roles.key })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(eq(userRoles.userId, userId));
  return rows.map((r) => r.key);
}

export async function isSuperAdmin(userId: string) {
  return (await roleKeysOf(userId)).includes("super_admin");
}

// Active Super Admins other than the given user. Used so the last one can never be removed.
export async function otherActiveSuperAdmins(excludeUserId: string) {
  const [r] = await db
    .select({ n: count() })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .innerJoin(user, eq(user.id, userRoles.userId))
    .where(
      and(
        eq(roles.key, "super_admin"),
        eq(user.status, "active"),
        eq(user.kind, "staff"),
        ne(user.id, excludeUserId)
      )
    );
  return r?.n ?? 0;
}