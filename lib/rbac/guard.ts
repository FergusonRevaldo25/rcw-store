import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { rolePermissions, userRoles } from "@/lib/db/schema";
import type { PermissionKey } from "./permissions";

// Server-only. Staff accounts with two-factor on, plus their permissions.
export async function getStaff() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const user = session.user as typeof session.user & {
    kind?: string;
    status?: string;
    twoFactorEnabled?: boolean | null;
  };

  if (user.kind !== "staff" || user.status === "suspended") redirect("/");
  if (!user.twoFactorEnabled) redirect("/admin/two-factor");

  const rows = await db
    .selectDistinct({ key: rolePermissions.permissionKey })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
    .where(eq(userRoles.userId, user.id));

  return { user, permissions: new Set(rows.map((r) => r.key)) };
}

// Use at the top of every admin page AND every admin server action.
export async function requirePermission(key: PermissionKey) {
  const staff = await getStaff();
  if (!staff.permissions.has(key)) redirect("/admin?denied=1");
  return staff;
}