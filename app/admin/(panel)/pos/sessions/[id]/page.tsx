import type { Metadata } from "next";
import Link from "next/link";
import { and, count, eq, sum } from "drizzle-orm";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import { db } from "@/lib/db";
import { orders, payments, posSessions, refunds } from "@/lib/db/schema";
import { rand } from "@/lib/pos/money";
import { requirePermission } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "Till summary | RCW Staff" };

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const staff = await requirePermission("pos:view");

  const [s] = await db.select().from(posSessions).where(eq(posSessions.id, id));
  if (!s) notFound();
  if (s.openedBy !== staff.user.id && !staff.permissions.has("pos:approve")) notFound();

  const byMethod = await db
    .select({ method: payments.method, total: sum(payments.amountCents), n: count() })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .where(and(eq(orders.posSessionId, id), eq(payments.status, "succeeded")))
    .groupBy(payments.method);

  const refundsByMethod = await db
    .select({ method: payments.method, total: sum(refunds.amountCents), n: count() })
    .from(refunds)
    .innerJoin(payments, eq(payments.id, refunds.paymentId))
    .where(and(eq(refunds.posSessionId, id), eq(refunds.status, "paid")))
    .groupBy(payments.method);

  const diff =
    s.countedCashCents !== null && s.expectedCashCents !== null
      ? s.countedCashCents - s.expectedCashCents
      : null;

  const rows: [string, string][] = [
    ["Till", s.till],
    ["Opened", s.openedAt.toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })],
    [
      "Closed",
      s.closedAt
        ? s.closedAt.toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })
        : "Still open",
    ],
    ["Opening float", rand(s.openingFloatCents)],
    ...byMethod.map((m): [string, string] => [
      `${m.method} sales (${m.n})`,
      rand(Number(m.total ?? 0)),
    ]),
    ...refundsByMethod.map((m): [string, string] => [
      `${m.method} refunds paid out (${m.n})`,
      `-${rand(Number(m.total ?? 0))}`,
    ]),
    ["Expected cash", s.expectedCashCents === null ? "n/a" : rand(s.expectedCashCents)],
    ["Counted cash", s.countedCashCents === null ? "n/a" : rand(s.countedCashCents)],
    [
      "Difference",
      diff === null ? "n/a" : diff === 0 ? "None" : `${diff > 0 ? "Over" : "Short"} by ${rand(Math.abs(diff))}`,
    ],
  ];

  return (
    <main className="max-w-lg">
      <PageHeader title="Till summary" />
      <dl className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 p-4">
            <dt className="text-sm capitalize text-[var(--muted)]">{k}</dt>
            <dd className="text-sm font-medium text-[var(--text)]">{v}</dd>
          </div>
        ))}
      </dl>
      <Link href="/admin/pos" className="mt-4 inline-block rounded text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)]">
        Back to point of sale
      </Link>
    </main>
  );
}