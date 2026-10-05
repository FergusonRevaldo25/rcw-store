import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { db } from "@/lib/db";
import { orders, refunds, user } from "@/lib/db/schema";
import { fmtDate } from "@/lib/pos/format";
import { rand } from "@/lib/pos/money";
import { requirePermission } from "@/lib/rbac/guard";
import { decideRefund, payRefund } from "./actions";

export const metadata: Metadata = { title: "Returns and refunds | RCW Staff" };

const TABS = [
  { key: "requested", label: "Waiting for approval" },
  { key: "approved", label: "Approved, to pay out" },
  { key: "paid", label: "Paid" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
] as const;

const NOTICES: Record<string, string> = {
  approved: "Refund approved. A cashier can now pay it out at their till.",
  rejected: "Refund rejected.",
  paid: "Refund paid out and recorded against your till.",
  own: "You requested that refund, so someone else must decide it.",
  note: "A rejection needs a note of at least 5 characters.",
  restock:
    "Items can only go back to stock on a single full refund that has not been restocked before.",
  notill: "Open your till first. The payout is recorded against it.",
  missing: "That refund is no longer waiting for this step.",
};

const TONE = {
  requested: "neutral",
  approved: "warn",
  paid: "good",
  rejected: "bad",
} as const;

const LABEL = {
  requested: "Waiting for approval",
  approved: "Approved, not yet paid out",
  paid: "Paid out",
  rejected: "Rejected",
} as const;

export default async function ReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; notice?: string }>;
}) {
  const staff = await requirePermission("returns:view");
  const { status, notice } = await searchParams;

  const active = TABS.find((t) => t.key === status)?.key ?? "requested";
  const canApprove = staff.permissions.has("returns:approve");
  const canPay = staff.permissions.has("pos:create");

  const requester = alias(user, "requester");
  const decider = alias(user, "decider");

  const base = db
    .select({
      id: refunds.id,
      orderId: refunds.orderId,
      orderNumber: orders.number,
      orderTotal: orders.totalCents,
      amountCents: refunds.amountCents,
      reason: refunds.reason,
      status: refunds.status,
      requestedBy: refunds.requestedBy,
      requesterEmail: requester.email,
      deciderEmail: decider.email,
      decisionNote: refunds.decisionNote,
      createdAt: refunds.createdAt,
      decidedAt: refunds.decidedAt,
      paidAt: refunds.paidAt,
    })
    .from(refunds)
    .innerJoin(orders, eq(orders.id, refunds.orderId))
    .leftJoin(requester, eq(requester.id, refunds.requestedBy))
    .leftJoin(decider, eq(decider.id, refunds.decidedBy));

  const rows = await (active === "all"
    ? base.orderBy(desc(refunds.createdAt)).limit(100)
    : base.where(eq(refunds.status, active)).orderBy(desc(refunds.createdAt)).limit(100));

  const field =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500";
  const primary =
    "min-h-10 rounded-lg bg-[var(--btn-bg)] px-4 text-sm font-medium text-[var(--btn-fg)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500";
  const secondary =
    "min-h-10 rounded-lg border border-[var(--border-strong)] px-4 text-sm font-medium text-[var(--text)] hover:bg-[var(--hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500";

  return (
    <main className="max-w-4xl">
      <PageHeader
        title="Returns and refunds"
        description="Refunds are requested at the till, approved by a different person, then paid out."
      />

      {notice && NOTICES[notice] && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] p-3 text-sm text-[var(--text)]"
        >
          {NOTICES[notice]}
        </p>
      )}

      <nav aria-label="Refund status" className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/returns?status=${t.key}`}
            aria-current={t.key === active ? "page" : undefined}
            className={`inline-flex min-h-10 items-center rounded-lg border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 ${
              t.key === active
                ? "border-[var(--border-strong)] bg-[var(--hover)] font-medium text-[var(--text)]"
                : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
          Nothing here.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const own = r.requestedBy === staff.user.id;
            const full = r.amountCents === r.orderTotal;
            return (
              <li
                key={r.id}
                className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[var(--text)]">
                    <span className="font-semibold">{rand(r.amountCents)}</span> on{" "}
                    <Link
                      href={`/admin/pos/sales/${r.orderId}`}
                      className="rounded underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
                    >
                      sale #{r.orderNumber}
                    </Link>{" "}
                    <span className="text-sm text-[var(--muted)]">of {rand(r.orderTotal)}</span>
                  </p>
                  <StatusBadge label={LABEL[r.status]} tone={TONE[r.status]} />
                </div>

                <p className="text-sm text-[var(--text)]">{r.reason}</p>
                <p className="text-xs text-[var(--dim)]">
                  Requested by {r.requesterEmail ?? "a removed user"} on {fmtDate(r.createdAt)}
                  {r.decidedAt && ` - decided by ${r.deciderEmail ?? "a removed user"} on ${fmtDate(r.decidedAt)}`}
                  {r.paidAt && ` - paid out ${fmtDate(r.paidAt)}`}
                </p>
                {r.decisionNote && (
                  <p className="text-sm text-[var(--muted)]">Note: {r.decisionNote}</p>
                )}

                {r.status === "requested" && canApprove && own && (
                  <p className="text-sm text-[var(--muted)]">
                    You requested this refund, so someone else must decide it.
                  </p>
                )}

                {r.status === "requested" && canApprove && !own && (
                  <details className="rounded-lg border border-[var(--border)] p-3">
                    <summary className="cursor-pointer rounded text-sm font-medium text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500">
                      Review this refund
                    </summary>
                    <form action={decideRefund} className="mt-3 space-y-3">
                      <input type="hidden" name="refundId" value={r.id} />
                      <div>
                        <label htmlFor={`note-${r.id}`} className="mb-1 block text-sm text-[var(--muted)]">
                          Note (required when rejecting)
                        </label>
                        <textarea
                          id={`note-${r.id}`}
                          name="note"
                          maxLength={300}
                          rows={2}
                          className={field}
                        />
                      </div>
                      {full && (
                        <label className="flex min-h-6 items-center gap-2 text-sm text-[var(--text)]">
                          <input type="checkbox" name="restock" className="size-4" />
                          Return the items to stock
                        </label>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button type="submit" name="decision" value="approve" className={primary}>
                          Approve
                        </button>
                        <button type="submit" name="decision" value="reject" className={secondary}>
                          Reject
                        </button>
                      </div>
                    </form>
                  </details>
                )}

                {r.status === "approved" && canPay && (
                  <form action={payRefund}>
                    <input type="hidden" name="refundId" value={r.id} />
                    <button type="submit" className={primary}>
                      Pay out at my till
                    </button>
                    <p className="mt-2 text-xs text-[var(--dim)]">
                      Hand the money back (or reverse the card or EFT), then press the button. It is recorded against your open till.
                    </p>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}