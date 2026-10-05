import type { Metadata } from "next";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import { db } from "@/lib/db";
import { categories, roles, staffCategoryAccess, user, userRoles } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac/guard";
import { isSuperAdmin, permissionsOfUser, rolePermissionMap } from "@/lib/rbac/staff";
import {
  assignRole,
  grantCategory,
  removeRole,
  removeStaff,
  revokeCategory,
  setStatus,
} from "../actions";

export const metadata: Metadata = { title: "Staff member | RCW Staff" };

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const field = `min-h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] ${focus}`;
const solid = `min-h-10 rounded-full bg-[var(--btn-bg)] px-5 text-sm font-semibold text-[var(--btn-fg)] ${focus}`;
const ghost = `min-h-10 rounded-full border border-[var(--border-strong)] px-5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] ${focus}`;
const card = "mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5";

const notices: Record<string, string> = {
  added: "Staff member added. They set up two-factor the first time they open the staff app.",
  saved: "Saved.",
  suspended: "Suspended and signed out everywhere.",
  self: "You cannot change your own access.",
  toomuch: "You can only manage staff, and grant roles, within your own access.",
  lastsuper: "That would leave no active Super Admin, so it was blocked.",
  invalid: "That request was not valid.",
};

export default async function StaffMemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { id } = await params;
  const { notice } = await searchParams;
  const me = await requirePermission("staff:view");

  const [p] = await db.select().from(user).where(eq(user.id, id));
  if (!p || p.kind !== "staff") notFound();

  const isSuper = await isSuperAdmin(me.user.id);
  const theirPerms = await permissionsOfUser(id);
  const manageable =
    me.permissions.has("staff:edit") &&
    id !== me.user.id &&
    (isSuper || theirPerms.every((k) => me.permissions.has(k)));

  const held = await db
    .select({ id: roles.id, name: roles.name, key: roles.key })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(eq(userRoles.userId, id));
  const heldIds = new Set(held.map((h) => h.id));

  const allRoles = await db.select().from(roles).orderBy(roles.name);
  const perms = await rolePermissionMap();
  const addable = allRoles.filter(
    (r) =>
      !heldIds.has(r.id) &&
      (isSuper || (perms.get(r.id) ?? []).every((k) => me.permissions.has(k)))
  );

  const cats = await db.select().from(categories).orderBy(categories.sortOrder);
  const granted = await db
    .select({ categoryId: staffCategoryAccess.categoryId })
    .from(staffCategoryAccess)
    .where(eq(staffCategoryAccess.userId, id));
  const grantedIds = new Set(granted.map((g) => g.categoryId));
  const worksAllCategories = held.some((h) => h.key === "super_admin" || h.key === "admin");

  return (
    <main className="max-w-3xl">
      <Link href="/admin/staff" className={`text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}>
        Back to staff
      </Link>
      <div className="mt-3">
        <PageHeader title={p.name} description={`${p.email}, ${p.status}, two-factor ${p.twoFactorEnabled ? "on" : "not set up"}`} />
      </div>

      {notice && notices[notice] && (
        <p role="alert" className="mb-4 rounded-lg border border-fuchsia-500/40 p-3 text-sm text-[var(--text)]">
          {notices[notice]}
        </p>
      )}
      {!manageable && (
        <p className="mb-4 rounded-lg border border-[var(--border)] p-3 text-sm text-[var(--muted)]">
          You can view this person but not change them. You cannot edit yourself or staff with more access than you have.
        </p>
      )}

      <section aria-labelledby="roles-h" className={card}>
        <h2 id="roles-h" className="font-semibold text-[var(--text)]">Roles</h2>
        <ul className="mt-3 space-y-2">
          {held.length === 0 && <li className="text-sm text-[var(--muted)]">No roles. This person can sign in but sees nothing.</li>}
          {held.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3 py-2">
              <span className="text-sm text-[var(--text)]">{r.name}</span>
              {manageable && (
                <form action={removeRole}>
                  <input type="hidden" name="userId" value={id} />
                  <input type="hidden" name="roleId" value={r.id} />
                  <button type="submit" aria-label={`Remove role ${r.name}`} className={`min-h-9 rounded px-2 text-xs text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}>
                    Remove
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
        {manageable && addable.length > 0 && (
          <form action={assignRole} className="mt-4 flex flex-wrap items-end gap-2">
            <input type="hidden" name="userId" value={id} />
            <label htmlFor="add-role" className="sr-only">Role to add</label>
            <select id="add-role" name="roleId" required defaultValue="" className={field}>
              <option value="" disabled>Add a role</option>
              {addable.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <button type="submit" className={solid}>Add role</button>
          </form>
        )}
      </section>

      <section aria-labelledby="cats-h" className={card}>
        <h2 id="cats-h" className="font-semibold text-[var(--text)]">Category access</h2>
        {worksAllCategories ? (
          <p className="mt-1 text-sm text-[var(--muted)]">Admin roles see every category.</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Product screens show only these categories. With none granted, this person sees no products.
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {cats.filter((c) => grantedIds.has(c.id)).map((c) => (
                <li key={c.id} className="flex items-center gap-1 rounded-full border border-[var(--border)] py-1 pl-3 pr-1 text-sm text-[var(--text)]">
                  {c.name}
                  {manageable && (
                    <form action={revokeCategory}>
                      <input type="hidden" name="userId" value={id} />
                      <input type="hidden" name="categoryId" value={c.id} />
                      <button type="submit" aria-label={`Remove access to ${c.name}`} className={`grid h-7 w-7 place-items-center rounded-full text-[var(--muted)] hover:text-[var(--text)] ${focus}`}>
                        x
                      </button>
                    </form>
                  )}
                </li>
              ))}
              {grantedIds.size === 0 && <li className="text-sm text-[var(--muted)]">None granted.</li>}
            </ul>
            {manageable && (
              <form action={grantCategory} className="mt-4 flex flex-wrap items-end gap-2">
                <input type="hidden" name="userId" value={id} />
                <label htmlFor="add-cat" className="sr-only">Category to add</label>
                <select id="add-cat" name="categoryId" required defaultValue="" className={field}>
                  <option value="" disabled>Add a category</option>
                  {cats.filter((c) => !grantedIds.has(c.id)).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button type="submit" className={solid}>Grant access</button>
              </form>
            )}
          </>
        )}
      </section>

      {manageable && (
        <section aria-labelledby="acct-h" className={card}>
          <h2 id="acct-h" className="font-semibold text-[var(--text)]">Account</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <form action={setStatus}>
              <input type="hidden" name="userId" value={id} />
              <input type="hidden" name="status" value={p.status === "active" ? "suspended" : "active"} />
              <button type="submit" className={ghost}>
                {p.status === "active" ? "Suspend and sign out" : "Reactivate"}
              </button>
            </form>
            {me.permissions.has("staff:delete") && (
              <form action={removeStaff}>
                <input type="hidden" name="userId" value={id} />
                <button type="submit" className={`${ghost} text-red-500`}>Remove staff access</button>
              </form>
            )}
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">
            Removing access turns the account back into a customer account and clears roles and category access.
          </p>
        </section>
      )}
    </main>
  );
}