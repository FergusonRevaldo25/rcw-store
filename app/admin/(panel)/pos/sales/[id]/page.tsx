import type { Metadata } from "next";
import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { requestRefund } from "@/app/admin/(panel)/returns/actions";
import { db } from "@/lib/db";
import { orderItems, orders, payments, refunds } from "@/lib/db/schema";
import { METHOD_LABEL, fmtDate } from "@/lib/pos/format";
import { rand } from "@/lib/pos/money";
import { requirePermission } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "Sale | RCW Staff" };

const NOTICES: Record<string, string> = {
  requested: "Refund requested. A different person with approval rights must approve it.",
  amount: "Enter a refund amount more than zero.",
  reason: "Enter a reason of at least 5 characters.",
  toomuch: "That is more than what is left to refund on this sale.",
  missing: "This sale cannot be refunded.",
};

const REFUND_TONE = {
  requested: "neutral",
  approved: "warn",
  paid: "good",
  rejected: "bad",
} as const;

const REFUND_LABEL = {
  requested: "Waiting for approval",
  approved: "Approved, not yet paid out",
  paid: "Paid out",
  rejected: "Rejected",
} as const;

export default async function SaleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { id } = await params;
  const { notice } = await searchParams;
  const staff = await requirePermission("pos:view");

  const [o] = await db.select().from(orders).where(eq(orders.id, id));
  if (!o || o.channel !== "pos") notFound();
  if (o.cashierId !== staff.user.id && !staff.permissions.has("pos:approve")) notFound();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id))
    .orderBy(asc(orderItems.name));
  const pays = await db.select().from(payments).where(eq(payments.orderId, id));
  const refundRows = await db
    .select()
    .from(refunds)
    .where(eq(refunds.orderId, id))
    .orderBy(desc(refunds.createdAt));

  const committed = refundRows
    .filter((r) => r.status !== "rejected")
    .reduce((n, r) => n + r.amountCents, 0);
  const remaining = o.totalCents - committed;
  const canRequest =
    staff.permissions.has("returns:create") &&
    remaining > 0 &&
    (o.status === "paid" || o.status === "fulfilled");

  const field =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500";

  return (
    <main className="max-w-3xl">
      <PageHeader
        title={`Sale #${o.number}`}
        description={fmtDate(o.createdAt)}
        actions={
          <Link
            href={`/admin/pos/receipt/${o.id}`}
            className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--text)] hover:bg-[var(--hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
          >
            View receipt
          </Link>
        }
      />

      {notice && NOTICES[notice] && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] p-3 text-sm text-[var(--text)]"
        >
          {NOTICES[notice]}
        </p>
      )}

      <section aria-labelledby="items-h" className="mb-6">
        <h2 id="items-h" className="mb-2 text-lg font-semibold text-[var(--text)]">
          Items
        </h2>
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full min-w-[480px] text-left text-sm">
            <caption className="sr-only">Items on this sale</caption>
            <thead className="border-b border-[var(--border)] text-[var(--muted)]">
              <tr>
                <th scope="col" className="p-3 font-medium">Item</th>
                <th scope="col" className="p-3 text-right font-medium">Qty</th>
                <th scope="col" className="p-3 text-right font-medium">Price</th>
                <th scope="col" className="p-3 text-right font-medium">Line total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {items.map((i) => (
                <tr key={i.id}>
                  <td className="p-3 text-[var(--text)]">{i.name}</td>
                  <td className="p-3 text-right text-[var(--muted)]">{i.quantity}</td>
                  <td className="p-3 text-right text-[var(--muted)]">{rand(i.unitPriceCents)}</td>
                  <td className="p-3 text-right text-[var(--text)]">{rand(i.lineTotalCents)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-[var(--border)]">
              <tr>
                <th scope="row" colSpan={3} className="p-3 text-right font-medium text-[var(--muted)]">
                  Total
                </th>
                <td className="p-3 text-right font-semibold text-[var(--text)]">
                  {rand(o.totalCents)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section aria-labelledby="pay-h" className="mb-6">
        <h2 id="pay-h" className="mb-2 text-lg font-semibold text-[var(--text)]">
          Payment
        </h2>
        <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm">
          {pays.map((p) => (
            <li key={p.id} className="flex flex-wrap justify-between gap-2 p-3">
              <span className="text-[var(--text)]">
                {METHOD_LABEL[p.method] ?? p.method}
                {p.providerRef ? ` (ref ${p.providerRef})` : ""}
              </span>
              <span className="text-[var(--muted)]">
                {rand(p.amountCents)} - {p.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ref-h" className="mb-6">
        <h2 id="ref-h" className="mb-2 text-lg font-semibold text-[var(--text)]">
          Refunds
        </h2>
        {refundRows.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No refunds on this sale.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm">
            {refundRows.map((r) => (
              <li key={r.id} className="space-y-1 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-[var(--text)]">{rand(r.amountCents)}</span>
                  <StatusBadge label={REFUND_LABEL[r.status]} tone={REFUND_TONE[r.status]} />
                </div>
                <p className="text-[var(--muted)]">{r.reason}</p>
                {r.decisionNote && (
                  <p className="text-[var(--muted)]">Decision note: {r.decisionNote}</p>
                )}
                <p className="text-xs text-[var(--dim)]">Requested {fmtDate(r.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {canRequest && (
        <section aria-labelledby="req-h">
          <h2 id="req-h" className="mb-2 text-lg font-semibold text-[var(--text)]">
            Request a refund
          </h2>
          <form
            action={requestRefund}
            className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <input type="hidden" name="orderId" value={o.id} />
            <div>
              <label htmlFor="amount" className="mb-1 block text-sm text-[var(--muted)]">
                Amount to refund (R). Up to {rand(remaining)} is left.
              </label>
              <input
                id="amount"
                name="amount"
                inputMode="decimal"
                required
                defaultValue={(remaining / 100).toFixed(2)}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="reason" className="mb-1 block text-sm text-[var(--muted)]">
                Reason (at least 5 characters)
              </label>
              <textarea
                id="reason"
                name="reason"
                required
                minLength={5}
                maxLength={300}
                rows={3}
                className={field}
              />
            </div>
            <p className="text-xs text-[var(--dim)]">
              Someone else must approve this before any money moves.
            </p>
            <button
              type="submit"
              className="min-h-10 rounded-lg bg-[var(--btn-bg)] px-4 text-sm font-medium text-[var(--btn-fg)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
            >
              Send refund request
            </button>
          </form>
        </section>
      )}

      <Link
        href="/admin/pos/sales"
        className="mt-6 inline-block rounded text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)]"
      >
        Back to POS sales
      </Link>
    </main>
  );
}