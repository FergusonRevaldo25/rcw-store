import type { Metadata } from "next";
import PageHeader from "@/components/admin/PageHeader";
import { db } from "@/lib/db";
import { permissions, roles } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac/guard";
import { rolePermissionMap } from "@/lib/rbac/staff";

export const metadata: Metadata = { title: "Roles and access | RCW Staff" };

export default async function RolesPage() {
  await requirePermission("roles:view");

  const allRoles = await db.select().from(roles).orderBy(roles.name);
  const allPerms = await db.select().from(permissions);
  const map = await rolePermissionMap();
  const info = new Map(allPerms.map((p) => [p.key, p]));

  return (
    <main className="max-w-3xl">
      <PageHeader
        title="Roles and access"
        description={`${allRoles.length} roles. Editing roles is coming; for now this is a read-only reference.`}
      />
      <ul className="space-y-3">
        {allRoles.map((r) => {
          const keys = map.get(r.id) ?? [];
          const byModule = new Map<string, string[]>();
          for (const k of keys) {
            const m = info.get(k)?.module ?? "other";
            byModule.set(m, [...(byModule.get(m) ?? []), k]);
          }
          return (
            <li key={r.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <details>
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70">
                  <span>
                    <span className="block font-semibold text-[var(--text)]">{r.name}</span>
                    <span className="block text-sm text-[var(--muted)]">{r.description}</span>
                  </span>
                  <span className="text-xs text-[var(--muted)]">{keys.length} permissions</span>
                </summary>
                <div className="space-y-3 border-t border-[var(--border)] p-4">
                  {[...byModule.entries()].sort().map(([m, ks]) => (
                    <div key={m}>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">{m.replace("_", " ")}</p>
                      <ul className="mt-1 flex flex-wrap gap-1.5">
                        {ks.map((k) => (
                          <li key={k} className="rounded-full bg-[var(--hover)] px-2.5 py-1 text-xs text-[var(--text)]">
                            {info.get(k)?.action ?? k}
                            {info.get(k)?.sensitive ? " (sensitive)" : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </main>
  );
}