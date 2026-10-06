import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { rand } from "@/lib/pos/money";

export const metadata: Metadata = {
  title: "Your order | RCW Store",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ token: string }> };

const STATUS: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  fulfilled: "Completed",
  cancelled: "Cancelled",
};

export default async function OrderPage({ params }: Props) {
  const { token } = await params;
  // Cheap shape check before touching the database.
  if (!/^[A-Za-z0-9_-]{32,64}$/.test(token)) notFound();

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.publicToken, token))
    .limit(1);
  if (!order) notFound();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const status = order.shippedAt ? "Shipped" : (STATUS[order.status] ?? order.status);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">
          Order #{order.number}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Status: <span className="font-semibold text-[var(--text)]">{status}</span>
        </p>

        {order.status === "pending" && (
          <p className="mt-4 rounded-lg border border-orange-500/40 bg-orange-500/10 p-3 text-sm text-[var(--text)]">
            We have your order. Online payment is being set up, so nothing has
            been charged. Keep this page address to come back to your order.
          </p>
        )}

        {order.trackingRef && (
          <p className="mt-4 text-sm text-[var(--text)]">
            Tracking reference: <span className="font-mono">{order.trackingRef}</span>
          </p>
        )}

        <section aria-label="Items" className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <ul className="divide-y divide-[var(--border)] text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 py-2">
                <span className="text-[var(--text)]">
                  {i.name}
                  <span className="text-[var(--muted)]"> x {i.quantity}</span>
                </span>
                <span className="shrink-0 text-[var(--text)]">{rand(i.lineTotalCents)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-[var(--border)] pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Subtotal</dt>
              <dd className="text-[var(--text)]">{rand(order.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Delivery</dt>
              <dd className="text-[var(--text)]">
                {order.deliveryCents === 0 ? "Free" : rand(order.deliveryCents)}
              </dd>
            </div>
            {order.vatCents > 0 && (
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">VAT included</dt>
                <dd className="text-[var(--text)]">{rand(order.vatCents)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base">
              <dt className="font-semibold text-[var(--text)]">Total</dt>
              <dd className="font-bold text-[var(--text)]">{rand(order.totalCents)}</dd>
            </div>
          </dl>
        </section>

        <section aria-label="Delivery address" className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--text)]">
          <h2 className="mb-2 font-semibold">Delivering to</h2>
          <address className="not-italic leading-relaxed">
            {order.shippingName}
            <br />
            {order.shippingAddress1}
            {order.shippingAddress2 ? (<><br />{order.shippingAddress2}</>) : null}
            <br />
            {order.shippingSuburb}, {order.shippingCity}
            <br />
            {order.shippingProvince} {order.shippingPostalCode}
          </address>
        </section>

        <Link
          href="/"
          className="mt-6 inline-flex min-h-10 items-center rounded-full border border-[var(--border-strong)] px-5 py-2 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
        >
          Back to the store
        </Link>
      </div>
    </main>
  );
}
