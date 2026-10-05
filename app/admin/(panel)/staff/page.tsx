import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import PageHeader from "@/components/admin/PageHeader";
import { db } from "@/lib/db";
import { roles, user, userRoles } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac/guard";
import { isSuperAdmin, rolePermissionMap } from "@/lib/rbac/staff";
import { addStaff } from "./actions";

export const metadata: Metadata = { title: "Staff | RCW Staff" };

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const field = `min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] ${focus}`;

export const notices: Record<string, string> = {
  invalid: "Check the details and try again. The confirmation box is required.",
  noaccount: "No account has that email. The person must sign up on the site first.",
  notcustomer: "That account is already staff or a seller, so it cannot be added here.",
  toomuch: "You can only grant access that you hold yourself.",
  removed: "Staff access removed. The account is now a normal customer.",
  missing: "That staff member was not found.",
};

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const me = await requirePermission("staff:view");
  const { notice } = await searchParams;
  const canAdd = me.permissions.has("staff:create");
  const isSuper = await isSuperAdmin(me.user.id);

  const people = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      twoFactor: user.twoFactorEnabled,
    })
    .from(user)
    .where(eq(user.kind, "staff"))
    .orderBy(user.name);

  const held = await db
    .select({ userId: userRoles.userId, role: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId));
  const rolesOf = (id: string) => held.filter((h) => h.userId === id).map((h) => h.role);

  const allRoles = await db.select().from(roles).orderBy(roles.name);
  const perms = await rolePermissionMap();
  const assignable = allRoles.filter(
    (r) => isSuper || (perms.get(r.id) ?? []).every((k) => me.permissions.has(k))
  );

  return (
    <main>
      <PageHeader title="Staff" description={`${people.length} staff accounts.`} />

      {notice && notices[notice] && (
        <p role="alert" className="mb-6 rounded-lg border border-fuchsia-500/40 p-3 text-sm text-[var(--text)]">
          {notices[notice]}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--muted)]">
            <tr>
              <th scope="col" className="p-4">Name</th>
              <th scope="col" className="p-4">Roles</th>
              <th scope="col" className="p-4">Status</th>
              <th scope="col" className="p-4">Two-factor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {people.map((p) => (
              <tr key={p.id} className="hover:bg-[var(--hover)]">
                <td className="p-4">
                  <Link href={`/admin/staff/${p.id}`} className={`rounded font-semibold text-[var(--text)] underline-offset-2 hover:underline ${focus}`}>
                    {p.name}
                  </Link>
                  <span className="block text-xs text-[var(--muted)]">{p.email}</span>
                </td>
                <td className="p-4 text-[var(--text)]">{rolesOf(p.id).join(", ") || "No role"}</td>
                <td className="p-4 capitalize text-[var(--text)]">{p.status}</td>
                <td className="p-4 text-[var(--text)]">{p.twoFactor ? "On" : "Not set up"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canAdd && (
        <section aria-labelledby="add-staff" className="mt-8 max-w-xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 id="add-staff" className="font-semibold text-[var(--text)]">Add a staff member</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            The person signs up on the site first. Then enter the email they used and choose a role.
            They set up two-factor the first time they open the staff app.
          </p>
          <form action={addStaff} className="mt-4 space-y-3">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--text)]">Account email</label>
              <input id="email" name="email" type="email" required className={field} />
            </div>
            <div>
              <label htmlFor="roleId" className="mb-1.5 block text-sm font-medium text-[var(--text)]">Role</label>
              <select id="roleId" name="roleId" required defaultValue="" className={field}>
                <option value="" disabled>Choose a role</option>
                {assignable.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <label className="flex items-start gap-3 text-sm text-[var(--muted)]">
              <input type="checkbox" name="confirm" className={`mt-0.5 h-5 w-5 shrink-0 ${focus}`} />
              <span>I confirm this person created this account themselves and I know who they are.</span>
            </label>
            <button type="submit" className={`min-h-11 rounded-full bg-[var(--btn-bg)] px-6 text-sm font-semibold text-[var(--btn-fg)] ${focus}`}>
              Add staff member
            </button>
          </form>
        </section>
      )}
    </main>
  );
}