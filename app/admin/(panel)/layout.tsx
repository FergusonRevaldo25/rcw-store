import type { ReactNode } from "react";
import AdminContainer from "@/components/admin/AdminContainer";
import AdminShell from "@/components/admin/AdminShell";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { getStaff } from "@/lib/rbac/guard";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, permissions } = await getStaff();

  // Each person only sees built pages their role allows.
  const groups = ADMIN_NAV.map((g) => ({
    ...g,
    items: g.items.filter(
      (i) => i.built && (i.href === "/admin" || permissions.has(i.permission)),
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <AdminShell groups={groups} email={user.email}>
      <AdminContainer>{children}</AdminContainer>
    </AdminShell>
  );
}
