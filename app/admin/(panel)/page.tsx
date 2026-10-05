import type { Metadata } from "next";
import { and, count, eq } from "drizzle-orm";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import { categoryScope, getVisibleCategoryIds } from "@/lib/catalogue/queries";
import { db } from "@/lib/db";
import { products, sellers, user } from "@/lib/db/schema";
import { getStaff } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "Dashboard | RCW Staff" };

async function n(q: Promise<{ n: number }[]>) {
  const [row] = await q;
  return row?.n ?? 0;
}

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { user: me, permissions } = await getStaff();
  const { denied } = await searchParams;
  const visible = await getVisibleCategoryIds(me.id);
  const can = (k: Parameters<typeof permissions.has>[0]) => permissions.has(k);

  const [live, pendingProducts, pendingSellers, customers, staff] = await Promise.all([
    can("products:view")
      ? n(db.select({ n: count() }).from(products).where(and(eq(products.status, "live"), categoryScope(products.categoryId, visible))))
      : 0,
    can("products:view")
      ? n(db.select({ n: count() }).from(products).where(and(eq(products.status, "pending_review"), categoryScope(products.categoryId, visible))))
      : 0,
    can("sellers:view")
      ? n(db.select({ n: count() }).from(sellers).where(eq(sellers.status, "pending")))
      : 0,
    can("customers:view")
      ? n(db.select({ n: count() }).from(user).where(eq(user.kind, "customer")))
      : 0,
    can("staff:view")
      ? n(db.select({ n: count() }).from(user).where(eq(user.kind, "staff")))
      : 0,
  ]);

  const firstName = me.name?.split(" ")[0] ?? "there";

  return (
    <main>
      <PageHeader title={`Welcome back, ${firstName}`} description="Here is what needs your attention today." />

      {denied && (
        <p role="alert" className="mb-6 rounded-lg border border-red-500/40 p-3 text-sm text-red-500">
          You do not have permission to open that page.
        </p>
      )}

      <section aria-label="Key numbers" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {can("products:view") && (
          <StatCard label="Live products" value={live} href="/admin/products" />
        )}
        {can("products:view") && (
          <StatCard label="Products to review" value={pendingProducts} href="/admin/products" attention={pendingProducts > 0} hint={pendingProducts ? "Waiting for a decision" : "All clear"} />
        )}
        {can("sellers:view") && (
          <StatCard label="Seller applications" value={pendingSellers} href="/admin/sellers" attention={pendingSellers > 0} hint={pendingSellers ? "Waiting for a decision" : "All clear"} />
        )}
        {can("customers:view") && <StatCard label="Customers" value={customers} />}
        {can("staff:view") && <StatCard label="Staff accounts" value={staff} />}
      </section>

      <section aria-label="Coming next" className="mt-8 rounded-xl border border-dashed border-[var(--border-strong)] p-5">
        <h2 className="text-sm font-semibold text-[var(--text)]">Not available yet</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Sales, revenue and stock figures will appear here once orders, the point of sale and
          inventory are built. They are left out on purpose rather than showing made-up numbers.
        </p>
        {can("sellers:view") && (
          <Link
            href="/admin/sellers"
            className="mt-4 inline-flex min-h-10 items-center rounded-full border border-[var(--border-strong)] px-5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
          >
            Review seller applications
          </Link>
        )}
      </section>
    </main>
  );
}