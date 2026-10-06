import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import Panel from "@/components/admin/Panel";
import StatusBadge from "@/components/admin/StatusBadge";
import { dateTime } from "@/lib/admin/table";
import { db } from "@/lib/db";
import { orderItems, orders, payments } from "@/lib/db/schema";
import { rand } from "@/lib/pos/money";
import { requirePermission } from "@/lib/rbac/guard";
import { markShipped } from "../actions";

export const metadata: Metadata = { title: "Order | RCW Staff" };

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const TONE = { pending: "warn", paid: "good", fulfilled: "good", cancelled: "bad" } as const;
const NOTICES: Record<string, string> = {
  tracking: "Enter a tracking reference of at least 3 characters.",
  shipped: "Marked as shipped.",
  cannot: "Only paid online orders can be marked as shipped.",
};

export default async function OrderDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { id } = await params;
  const { notice } = await searchParams;
  const staff = await requirePermission("orders:view");

  const [o] = await db.select().from(orders).where(eq(orders.id, id));
  if (!o) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id)).orderBy(asc(orderItems.name));
  const pays = await db.select().from(payments).where(eq(payments.orderId, id));
  const canShip = staff.permissions.has("orders:edit") && o.channel === "online" && o.status === "paid";

  return (
    <main className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={`Order #${o.number}`}
        description={`${o.channel === "pos" ? "Till" : "Online"} order, placed ${dateTime(o.createdAt)}`}
        actions={<StatusBadge label={o.status} tone={TONE[o.status]} />}
      />
      {notice && NOTICES[notice] && (
        <p role="status" className="rounded-lg border border-fuchsia-500/40 p-3 text-sm text-[var(--text)]">{NOTICES[notice]}</p>
      )}

      <Panel title="Items">
        <table>
          <thead><tr><th scope="col">Item</th><th scope="col" className="text-right">Qty</th><th scope="col" className="text-right">Total</th></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}><td>{i.name}</td><td className="text-right">{i.quantity}</td><td className="text-right">{rand(i.lineTotalCents)}</td></tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={2} className="text-right text-[var(--muted)]">Delivery</td><td className="text-right">{rand(o.deliveryCents)}</td></tr>
            <tr><td colSpan={2} className="text-right font-semibold">Total</td><td className="text-right font-bold">{rand(o.totalCents)}</td></tr>
          </tfoot>
        </table>
      </Panel>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Customer and delivery">
          <div className="space-y-1 p-5 text-sm text-[var(--text)]">
            <p>{o.customerName ?? "Walk-in"}</p>
            {o.customerEmail && <p className="text-[var(--muted)]">{o.customerEmail}</p>}
            {o.channel === "online" && (
              <address className="mt-3 not-italic leading-relaxed">
                {o.shippingAddress1}<br />
                {o.shippingAddress2 && <>{o.shippingAddress2}<br /></>}
                {o.shippingSuburb}, {o.shippingCity}<br />
                {o.shippingProvince}, {o.shippingPostalCode}<br />
                {o.shippingPhone}
              </address>
            )}
          </div>
        </Panel>

        <Panel title="Payments">
          {pays.length === 0 ? (
            <p className="p-5 text-sm text-[var(--muted)]">No payment recorded yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {pays.map((p) => (
                <li key={p.id} className="flex justify-between gap-3 px-5 py-3 text-sm text-[var(--text)]">
                  <span className="capitalize">{p.method} ({p.status})</span>
                  <span className="font-semibold">{rand(p.amountCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {o.channel === "online" && (
        <Panel title="Fulfilment">
          <div className="p-5 text-sm text-[var(--text)]">
            {o.shippedAt ? (
              <p>Shipped {dateTime(o.shippedAt)}. Tracking: {o.trackingRef}</p>
            ) : canShip ? (
              <form action={markShipped} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="orderId" value={o.id} />
                <div>
                  <label htmlFor="tracking" className="mb-1 block text-xs text-[var(--muted)]">Tracking reference</label>
                  <input id="tracking" name="tracking" required minLength={3} maxLength={60} className={`min-h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 ${focus}`} />
                </div>
                <button type="submit" className={`min-h-11 rounded-full bg-[var(--btn-bg)] px-6 font-semibold text-[var(--btn-fg)] ${focus}`}>Mark as shipped</button>
              </form>
            ) : (
              <p className="text-[var(--muted)]">Not ready to ship. The order must be paid first.</p>
            )}
          </div>
        </Panel>
      )}

      <Link href="/admin/orders" className={`inline-block rounded text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}>Back to orders</Link>
    </main>
  );
}