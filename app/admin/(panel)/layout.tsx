import type { ReactNode } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { getStaff } from "@/lib/rbac/guard";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, permissions } = await getStaff();

  // Each person only sees the sections their role allows.
  const groups = ADMIN_NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.href === "/admin" || permissions.has(i.permission)),
  })).filter((g) => g.items.length > 0);

  return (
    <AdminShell groups={groups} email={user.email}>
      {children}
    </AdminShell>
  );
}