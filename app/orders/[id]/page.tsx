import type { Metadata } from "next";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { rand } from "@/lib/pos/money";

export const metadata: Metadata = { title: "Order | RCW Store" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Waiting for payment",
  paid: "Paid",
  fulfilled: "Completed",
  cancelled: "Cancelled",
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  // Only the customer who placed the order can open it.
  const [o] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.customerId, user.id)));
  if (!o) notFound();

  const items = await db
    .select({
      id: orderItems.id,
      name: orderItems.name,
      qty: orderItems.quantity,
      unit: orderItems.unitPriceCents,
      line: orderItems.lineTotalCents,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, o.id));

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl p-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "My orders", href: "/orders" },
            { label: `Order #${o.number}` },
          ]}
        />
        <h1 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">Order #{o.number}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {o.createdAt.toLocaleDateString("en-ZA", {
            timeZone: "Africa/Johannesburg",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {", "}
          {STATUS_LABEL[o.status] ?? o.status}
        </p>

        <ul className="mt-6 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {items.map((i) => (
            <li key={i.id} className="flex items-start justify-between gap-4 p-4 text-sm">
              <div>
                <p className="font-medium text-[var(--text)]">{i.name}</p>
                <p className="text-[var(--muted)]">
                  {i.qty} x {rand(i.unit)}
                </p>
              </div>
              <p className="font-semibold text-[var(--text)]">{rand(i.line)}</p>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Subtotal</dt>
            <dd className="text-[var(--text)]">{rand(o.subtotalCents)}</dd>
          </div>
          {o.discountCents > 0 && (
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Discount</dt>
              <dd className="text-[var(--text)]">-{rand(o.discountCents)}</dd>
            </div>
          )}
          {o.vatCents > 0 && (
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">{o.vatIncluded ? "VAT included" : "VAT"}</dt>
              <dd className="text-[var(--text)]">{rand(o.vatCents)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-[var(--border)] pt-2 text-base font-bold">
            <dt className="text-[var(--text)]">Total</dt>
            <dd className="text-[var(--text)]">{rand(o.totalCents)}</dd>
          </div>
        </dl>

        <Link
          href="/orders"
          className="mt-6 inline-block rounded text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
        >
          Back to my orders
        </Link>
      </div>
    </main>
  );
}