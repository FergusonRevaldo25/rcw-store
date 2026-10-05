"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditValues } from "@/lib/audit/log";
import { db } from "@/lib/db";
import {
  auditLog,
  roles,
  session,
  staffCategoryAccess,
  user,
  userRoles,
} from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac/guard";
import type { PermissionKey } from "@/lib/rbac/permissions";
import {
  isSuperAdmin,
  otherActiveSuperAdmins,
  permissionsOfRole,
  permissionsOfUser,
  roleKeysOf,
} from "@/lib/rbac/staff";

type Staff = Awaited<ReturnType<typeof requirePermission>>;

function end(path: string, notice: string): never {
  revalidatePath("/admin/staff");
  redirect(`${path}?notice=${notice}`);
}

async function begin(p: PermissionKey) {
  const staff = await requirePermission(p);
  return { staff, isSuper: await isSuperAdmin(staff.user.id) };
}

// You can only grant what you hold yourself (Super Admin excepted).
const within = (staff: Staff, keys: string[]) =>
  keys.every((k) => staff.permissions.has(k));

async function guardTarget(staff: Staff, isSuper: boolean, id: string, path: string) {
  if (id === staff.user.id) end(path, "self");
  const [t] = await db
    .select({ id: user.id, kind: user.kind })
    .from(user)
    .where(eq(user.id, id));
  if (!t || t.kind !== "staff") end("/admin/staff", "missing");
  if (!isSuper && !within(staff, await permissionsOfUser(id))) end(path, "toomuch");
}

async function guardRole(staff: Staff, isSuper: boolean, roleId: string, path: string) {
  const [r] = await db.select({ key: roles.key }).from(roles).where(eq(roles.id, roleId));
  if (!r) end(path, "invalid");
  if (!isSuper && !within(staff, await permissionsOfRole(roleId))) end(path, "toomuch");
  return r;
}

export async function addStaff(fd: FormData) {
  const { staff, isSuper } = await begin("staff:create");
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const roleId = String(fd.get("roleId") ?? "");
  if (fd.get("confirm") !== "on" || !email || !roleId) end("/admin/staff", "invalid");

  const [target] = await db.select().from(user).where(eq(user.email, email));
  if (!target) end("/admin/staff", "noaccount");
  if (target.kind !== "customer") end("/admin/staff", "notcustomer");
  const role = await guardRole(staff, isSuper, roleId, "/admin/staff");

  await db.transaction(async (tx) => {
    await tx.update(user).set({ kind: "staff" }).where(eq(user.id, target.id));
    await tx
      .insert(userRoles)
      .values({ userId: target.id, roleId, grantedBy: staff.user.id })
      .onConflictDoNothing();
    await tx.insert(auditLog).values(
      auditValues(staff.user, "staff.add", "user", target.id, { kind: "customer" }, { kind: "staff", role: role.key })
    );
  });
  revalidatePath("/admin/staff");
  redirect(`/admin/staff/${target.id}?notice=added`);
}

export async function assignRole(fd: FormData) {
  const { staff, isSuper } = await begin("staff:edit");
  const id = String(fd.get("userId") ?? "");
  const roleId = String(fd.get("roleId") ?? "");
  const path = `/admin/staff/${id}`;
  await guardTarget(staff, isSuper, id, path);
  const role = await guardRole(staff, isSuper, roleId, path);

  await db.transaction(async (tx) => {
    await tx
      .insert(userRoles)
      .values({ userId: id, roleId, grantedBy: staff.user.id })
      .onConflictDoNothing();
    await tx.insert(auditLog).values(auditValues(staff.user, "staff.role.grant", "user", id, null, { role: role.key }));
  });
  end(path, "saved");
}

export async function removeRole(fd: FormData) {
  const { staff, isSuper } = await begin("staff:edit");
  const id = String(fd.get("userId") ?? "");
  const roleId = String(fd.get("roleId") ?? "");
  const path = `/admin/staff/${id}`;
  await guardTarget(staff, isSuper, id, path);
  const role = await guardRole(staff, isSuper, roleId, path);
  if (role.key === "super_admin" && (await otherActiveSuperAdmins(id)) === 0) end(path, "lastsuper");

  await db.transaction(async (tx) => {
    await tx.delete(userRoles).where(and(eq(userRoles.userId, id), eq(userRoles.roleId, roleId)));
    await tx.insert(auditLog).values(auditValues(staff.user, "staff.role.revoke", "user", id, { role: role.key }, null));
  });
  end(path, "saved");
}

export async function setStatus(fd: FormData) {
  const { staff, isSuper } = await begin("staff:edit");
  const id = String(fd.get("userId") ?? "");
  const status = String(fd.get("status") ?? "");
  const path = `/admin/staff/${id}`;
  if (status !== "active" && status !== "suspended") end(path, "invalid");
  await guardTarget(staff, isSuper, id, path);
  if (
    status === "suspended" &&
    (await roleKeysOf(id)).includes("super_admin") &&
    (await otherActiveSuperAdmins(id)) === 0
  ) {
    end(path, "lastsuper");
  }

  await db.transaction(async (tx) => {
    await tx.update(user).set({ status }).where(eq(user.id, id));
    if (status === "suspended") await tx.delete(session).where(eq(session.userId, id));
    await tx.insert(auditLog).values(auditValues(staff.user, `staff.${status}`, "user", id, null, { status }));
  });
  end(path, status === "suspended" ? "suspended" : "saved");
}

export async function removeStaff(fd: FormData) {
  const { staff, isSuper } = await begin("staff:delete");
  const id = String(fd.get("userId") ?? "");
  const path = `/admin/staff/${id}`;
  await guardTarget(staff, isSuper, id, path);
  if ((await roleKeysOf(id)).includes("super_admin") && (await otherActiveSuperAdmins(id)) === 0) {
    end(path, "lastsuper");
  }

  await db.transaction(async (tx) => {
    await tx.delete(userRoles).where(eq(userRoles.userId, id));
    await tx.delete(staffCategoryAccess).where(eq(staffCategoryAccess.userId, id));
    await tx.delete(session).where(eq(session.userId, id));
    await tx.update(user).set({ kind: "customer" }).where(eq(user.id, id));
    await tx.insert(auditLog).values(auditValues(staff.user, "staff.remove", "user", id, { kind: "staff" }, { kind: "customer" }));
  });
  end("/admin/staff", "removed");
}

export async function grantCategory(fd: FormData) {
  const { staff, isSuper } = await begin("staff:edit");
  const id = String(fd.get("userId") ?? "");
  const categoryId = String(fd.get("categoryId") ?? "");
  const path = `/admin/staff/${id}`;
  await guardTarget(staff, isSuper, id, path);
  if (!categoryId) end(path, "invalid");

  await db.transaction(async (tx) => {
    await tx
      .insert(staffCategoryAccess)
      .values({ userId: id, categoryId, grantedBy: staff.user.id })
      .onConflictDoNothing();
    await tx.insert(auditLog).values(auditValues(staff.user, "staff.category.grant", "user", id, null, { categoryId }));
  });
  end(path, "saved");
}

export async function revokeCategory(fd: FormData) {
  const { staff, isSuper } = await begin("staff:edit");
  const id = String(fd.get("userId") ?? "");
  const categoryId = String(fd.get("categoryId") ?? "");
  const path = `/admin/staff/${id}`;
  await guardTarget(staff, isSuper, id, path);

  await db.transaction(async (tx) => {
    await tx
      .delete(staffCategoryAccess)
      .where(and(eq(staffCategoryAccess.userId, id), eq(staffCategoryAccess.categoryId, categoryId)));
    await tx.insert(auditLog).values(auditValues(staff.user, "staff.category.revoke", "user", id, { categoryId }, null));
  });
  end(path, "saved");
}