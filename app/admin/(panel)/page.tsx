import type { Metadata } from "next";
import { and, count, eq } from "drizzle-orm";
import Link from "next/link";
import { DayBars, HBars } from "@/components/admin/charts";
import Panel from "@/components/admin/Panel";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import {
  LOW_STOCK_AT,
  dailySales,
  lowStock,
  paymentSplit,
  saToday,
  topSellers,
} from "@/lib/admin/stats";
import { categoryScope, getVisibleCategoryIds } from "@/lib/catalogue/queries";
import { db } from "@/lib/db";
import { products, sellers, user } from "@/lib/db/schema";
import { METHOD_LABEL } from "@/lib/pos/format";
import { rand } from "@/lib/pos/money";
import { getStaff } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "Dashboard | RCW Staff" };

async function n(q: Promise<{ n: number }[]>) {
  const [row] = await q;
  return row?.n ?? 0;
}

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const chip = `inline-flex min-h-10 items-center rounded-full bg-white/15 px-4 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/25 ${focus}`;

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { user: me, permissions } = await getStaff();
  const { denied } = await searchParams;
  const visible = await getVisibleCategoryIds(me.id);
  const can = (k: Parameters<typeof permissions.has>[0]) => permissions.has(k);

  const showSales = can("orders:view");
  const showStock = can("inventory:view");

  const [live, pendingProducts, pendingSellers, customers, staff, days, split, top, low] =
    await Promise.all([
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
      showSales ? dailySales() : [],
      showSales ? paymentSplit() : [],
      showSales ? topSellers() : [],
      showStock ? lowStock() : [],
    ]);

  const firstName = me.name?.split(" ")[0] ?? "there";

  // Totals come from the same 31 days of data.
  const today = saToday();
  const monthPrefix = today.slice(0, 7);
  const sum = (rows: typeof days) => rows.reduce((t, d) => t + d.cents, 0);
  const todayCents = sum(days.filter((d) => d.day === today));
  const weekCents = sum(days.slice(-7));
  const prevWeekCents = sum(days.slice(-14, -7));
  const monthCents = sum(days.filter((d) => d.day.startsWith(monthPrefix)));

  // Only show a trend when last week had sales to compare against.
  const pct = prevWeekCents > 0 ? Math.round(((weekCents - prevWeekCents) / prevWeekCents) * 100) : null;
  const weekTrend = pct === null ? undefined : { text: `${Math.abs(pct)}%`, up: pct >= 0 };

  const last14 = days.slice(-14).map((d) => {
    const date = new Date(`${d.day}T00:00:00Z`);
    return {
      label: String(date.getUTCDate()),
      title: date.toLocaleDateString("en-ZA", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }),
      value: d.cents,
    };
  });
  const spark = last14.map((d) => d.value);

  const dateLabel = new Date().toLocaleDateString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="space-y-8">
      <section
        aria-label="Welcome"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-fuchsia-600 to-orange-500 p-6 text-white shadow-[0_24px_60px_-24px_rgba(168,85,247,0.7)] sm:p-8"
      >
        <div aria-hidden="true" className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-black/20 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/80">{dateLabel}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Welcome back, {firstName}</h1>
            <p className="mt-2 max-w-xl text-sm text-white/90">
              {pendingProducts + pendingSellers > 0
                ? `${pendingProducts + pendingSellers} item${pendingProducts + pendingSellers === 1 ? "" : "s"} waiting for your decision.`
                : "Nothing is waiting for you. Here is how the business is doing."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {can("pos:view") && <Link href="/admin/pos" className={chip}>Open the till</Link>}
              {can("products:view") && <Link href="/admin/products" className={chip}>Review products</Link>}
              {can("sellers:view") && <Link href="/admin/sellers" className={chip}>Seller applications</Link>}
            </div>
          </div>
          {showSales && (
            <div className="rounded-2xl bg-black/20 px-6 py-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/80">Sales today</p>
              <p className="mt-1 text-4xl font-extrabold tabular-nums">{rand(todayCents)}</p>
            </div>
          )}
        </div>
      </section>

      {denied && (
        <p role="alert" className="rounded-lg border border-red-500/40 p-3 text-sm text-red-500">
          You do not have permission to open that page.
        </p>
      )}

      <section aria-label="Key numbers" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {can("products:view") && <StatCard label="Live products" value={live} href="/admin/products" />}
        {can("products:view") && (
          <StatCard label="Products to review" value={pendingProducts} href="/admin/products" attention={pendingProducts > 0} hint={pendingProducts ? "Waiting for a decision" : "All clear"} />
        )}
        {can("sellers:view") && (
          <StatCard label="Seller applications" value={pendingSellers} href="/admin/sellers" attention={pendingSellers > 0} hint={pendingSellers ? "Waiting for a decision" : "All clear"} />
        )}
        {can("customers:view") && <StatCard label="Customers" value={customers} />}
        {can("staff:view") && <StatCard label="Staff accounts" value={staff} />}
      </section>

      {showSales && (
        <>
          <section aria-labelledby="sales-h">
            <h2 id="sales-h" className="mb-1 text-lg font-semibold text-[var(--text)]">Sales</h2>
            <p className="mb-4 text-sm text-[var(--muted)]">
              Paid and fulfilled orders, before refunds, in South African time.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Today" value={rand(todayCents)} href="/admin/orders" spark={spark} />
              <StatCard label="Last 7 days" value={rand(weekCents)} href="/admin/orders" trend={weekTrend} hint={weekTrend ? "Compared with the 7 days before" : undefined} />
              <StatCard label="This month" value={rand(monthCents)} href="/admin/orders" />
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Sales per day" description="Last 14 days" className="lg:col-span-2">
              <div className="p-5">
                <DayBars data={last14} caption="Sales per day for the last 14 days" format={rand} />
              </div>
            </Panel>
            <Panel title="Payments by method" description="Last 30 days">
              <div className="p-5">
                <HBars
                  caption="Payments by method"
                  format={rand}
                  empty="No payments yet."
                  data={split.map((s) => ({
                    label: METHOD_LABEL[s.method] ?? s.method,
                    value: s.cents,
                    note: `(${s.count})`,
                  }))}
                />
              </div>
            </Panel>
          </div>
        </>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {showSales && (
          <Panel title="Top sellers" description="By units, last 30 days">
            <div className="p-5">
              <HBars
                caption="Top sellers by units sold"
                format={(v) => `${v} sold`}
                empty="No sales yet."
                data={top.map((t) => ({ label: t.name, value: t.units }))}
              />
            </div>
          </Panel>
        )}

        {showStock && (
          <Panel
            title={`Low stock (${LOW_STOCK_AT} or fewer)`}
            actions={
              <Link href="/admin/inventory?level=low" className={`rounded text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}>
                See inventory
              </Link>
            }
          >
            {low.length === 0 ? (
              <p role="status" className="p-5 text-sm text-[var(--muted)]">Nothing is running low.</p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {low.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    {p.sellerId === null ? (
                      <Link href={`/admin/products/${p.id}`} className={`min-w-0 truncate rounded text-[var(--text)] underline underline-offset-2 ${focus}`}>
                        {p.name}
                      </Link>
                    ) : (
                      <span className="min-w-0 truncate text-[var(--text)]">{p.name}</span>
                    )}
                    <StatusBadge label={p.stock === 0 ? "Out of stock" : `${p.stock} left`} tone={p.stock === 0 ? "bad" : "warn"} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}
      </div>
    </main>
  );
}