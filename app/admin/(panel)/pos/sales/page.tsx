import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, inArray, sum } from "drizzle-orm";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { db } from "@/lib/db";
import { orders, payments, posSessions, refunds, user } from "@/lib/db/schema";
import { METHOD_LABEL, fmtDate } from "@/lib/pos/format";
import { rand } from "@/lib/pos/money";
import { requirePermission } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "POS sales | RCW Staff" };

export default async function PosSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const staff = await requirePermission("pos:view");
  const { q } = await searchParams;

  // Cashiers see their own sales. Approvers see every till.
  const seeAll = staff.permissions.has("pos:approve");
  const term = (q ?? "").trim();
  const number = /^\d{1,9}$/.test(term) ? Number(term) : null;

  const conds = [eq(orders.channel, "pos")];
  if (!seeAll) conds.push(eq(orders.cashierId, staff.user.id));
  if (number !== null) conds.push(eq(orders.number, number));

  const rows = await db
    .select({
      id: orders.id,
      number: orders.number,
      createdAt: orders.createdAt,
      totalCents: orders.totalCents,
      method: payments.method,
      cashier: user.email,
      till: posSessions.till,
    })
    .from(orders)
    .leftJoin(payments, eq(payments.orderId, orders.id))
    .leftJoin(user, eq(user.id, orders.cashierId))
    .leftJoin(posSessions, eq(posSessions.id, orders.posSessionId))
    .where(and(...conds))
    .orderBy(desc(orders.createdAt))
    .limit(100);

  const ids = rows.map((r) => r.id);
  const refundRows = ids.length
    ? await db
        .select({
          orderId: refunds.orderId,
          status: refunds.status,
          total: sum(refunds.amountCents),
        })
        .from(refunds)
        .where(
          and(
            inArray(refunds.orderId, ids),
            inArray(refunds.status, ["requested", "approved", "paid"])
          )
        )
        .groupBy(refunds.orderId, refunds.status)
    : [];

  const refunded = new Map<string, number>();
  const pending = new Set<string>();
  for (const r of refundRows) {
    if (r.status === "requested") pending.add(r.orderId);
    else refunded.set(r.orderId, (refunded.get(r.orderId) ?? 0) + Number(r.total ?? 0));
  }

  return (
    <main>
      <PageHeader
        title="POS sales"
        description={
          seeAll
            ? "Every till sale. Showing the latest 100."
            : "Your till sales. Showing the latest 100."
        }
      />

      <form method="get" className="mb-4 flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="q" className="mb-1 block text-sm text-[var(--muted)]">
            Order number
          </label>
          <input
            id="q"
            name="q"
            inputMode="numeric"
            defaultValue={term}
            placeholder="1000"
            className="min-h-10 w-40 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
          />
        </div>
        <button
          type="submit"
          className="min-h-10 rounded-lg bg-[var(--btn-bg)] px-4 text-sm font-medium text-[var(--btn-fg)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
        >
          Search
        </button>
        {term && (
          <Link
            href="/admin/pos/sales"
            className="inline-flex min-h-10 items-center rounded px-2 text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)]"
          >
            Clear
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
          No sales found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Point of sale sales, newest first</caption>
            <thead className="border-b border-[var(--border)] text-[var(--muted)]">
              <tr>
                <th scope="col" className="p-3 font-medium">Order</th>
                <th scope="col" className="p-3 font-medium">Date</th>
                <th scope="col" className="p-3 font-medium">Till</th>
                {seeAll && <th scope="col" className="p-3 font-medium">Cashier</th>}
                <th scope="col" className="p-3 font-medium">Paid by</th>
                <th scope="col" className="p-3 text-right font-medium">Total</th>
                <th scope="col" className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((r) => {
                const back = refunded.get(r.id) ?? 0;
                return (
                  <tr key={r.id}>
                    <td className="p-3">
                      <Link
                        href={`/admin/pos/sales/${r.id}`}
                        className="rounded font-medium text-[var(--text)] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
                      >
                        #{r.number}
                      </Link>
                    </td>
                    <td className="p-3 text-[var(--muted)]">{fmtDate(r.createdAt)}</td>
                    <td className="p-3 text-[var(--muted)]">{r.till ?? "n/a"}</td>
                    {seeAll && <td className="p-3 text-[var(--muted)]">{r.cashier ?? "n/a"}</td>}
                    <td className="p-3 text-[var(--muted)]">
                      {r.method ? (METHOD_LABEL[r.method] ?? r.method) : "n/a"}
                    </td>
                    <td className="p-3 text-right font-medium text-[var(--text)]">
                      {rand(r.totalCents)}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        {back >= r.totalCents ? (
                          <StatusBadge label="Fully refunded" tone="warn" />
                        ) : back > 0 ? (
                          <StatusBadge label={`Part refunded ${rand(back)}`} tone="warn" />
                        ) : (
                          <StatusBadge label="Paid" tone="good" />
                        )}
                        {pending.has(r.id) && <StatusBadge label="Refund requested" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}