import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import Breadcrumbs from "@/components/Breadcrumbs";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { rand } from "@/lib/pos/money";

export const metadata: Metadata = { title: "My orders | RCW Store" };
export const dynamic = "force-dynamic";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export const STATUS_LABEL: Record<string, string> = {
  pending: "Waiting for payment",
  paid: "Paid",
  fulfilled: "Completed",
  cancelled: "Cancelled",
};

export default async function OrdersPage() {
  const user = await requireUser();

  const rows = await db
    .select({
      id: orders.id,
      number: orders.number,
      status: orders.status,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.customerId, user.id))
    .orderBy(desc(orders.createdAt))
    .limit(50);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl p-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My orders" }]} />
        <h1 className="mb-6 text-2xl font-bold text-[var(--text)] sm:text-3xl">My orders</h1>

        {rows.length === 0 ? (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <h2 className="text-lg font-semibold text-[var(--text)]">No orders yet</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              When you place an order it will show up here.
            </p>
            <Link
              href="/"
              className={`mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--btn-bg)] px-6 text-sm font-semibold text-[var(--btn-fg)] ${focus}`}
            >
              Start shopping
            </Link>
          </section>
        ) : (
          <ul className="space-y-3">
            {rows.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/orders/${o.id}`}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--border-strong)] ${focus}`}
                >
                  <div>
                    <p className="font-semibold text-[var(--text)]">Order #{o.number}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {o.createdAt.toLocaleDateString("en-ZA", {
                        timeZone: "Africa/Johannesburg",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {", "}
                      {STATUS_LABEL[o.status] ?? o.status}
                    </p>
                  </div>
                  <p className="font-bold text-[var(--text)]">{rand(o.totalCents)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}