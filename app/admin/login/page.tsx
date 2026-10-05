import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Staff sign in | RCW Staff",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) {
    const u = session.user as typeof session.user & {
      kind?: string;
      twoFactorEnabled?: boolean | null;
    };
    if (u.kind === "staff") redirect(u.twoFactorEnabled ? "/admin" : "/admin/two-factor");
  }
  return <AdminLoginForm />;
}