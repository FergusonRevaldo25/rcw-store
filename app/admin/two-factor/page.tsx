import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TwoFactorSetup from "@/components/TwoFactorSetup";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Two-factor setup | RCW Store" };

export default async function AdminTwoFactorPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const user = session.user as typeof session.user & {
    kind?: string;
    twoFactorEnabled?: boolean | null;
  };
  if (user.kind !== "staff") redirect("/");
  if (user.twoFactorEnabled) redirect("/admin");

  return (
    <main className="min-h-[70vh]">
      <div className="mx-auto max-w-md px-6 py-12">
        <h1 className="text-2xl font-bold text-[var(--text)]">Set up two-factor</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Admin accounts need a second check at sign-in before they can open the dashboard.
        </p>
        <TwoFactorSetup />
      </div>
    </main>
  );
}