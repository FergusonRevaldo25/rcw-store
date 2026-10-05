import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import Pagination from "@/components/admin/Pagination";
import StatusBadge from "@/components/admin/StatusBadge";
import TableToolbar from "@/components/admin/TableToolbar";
import { dateTime, PAGE_SIZE, parsePage } from "@/lib/admin/table";
import { db } from "@/lib/db";
import { orders, payments } from "@/lib/db/schema";
import { METHOD_LABEL } from "@/lib/pos/format";
import { rand } from "@/lib/pos/money";
import { requirePermission } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "Transactions | RCW Staff" };

const METHODS = ["cash", "card", "eft", "payfast", "ozow"] as const;
const STATUSES = ["pending", "succeeded", "failed", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABEL: Record<Status, string> = {
  pending: "Pending",
  succeeded: "Succeeded",
  failed: "Failed",
  cancelled: "Cancelled",
};
const TONE: Record<Status, "neutral" | "good" | "warn" | "bad"> = {
  pending: "warn",
  succeeded: "good",
  failed: "bad",
  cancelled: "neutral",
};

type Row = {
  id: string;
  orderId: string;
  number: number;
  channel: "pos" | "online";
  method: string;
  status: Status;
  amountCents: number;
  providerRef: string | null;
  createdAt: Date;
};

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; method?: string; status?: string; page?: string }>;
}) {
  await requirePermission("transactions:view");
  const sp = await searchParams;

  const q = (sp.q ?? "").trim().slice(0, 60);
  const method = METHODS.find((m) => m === sp.method);
  const status = STATUSES.find((s) => s === sp.status);
  const page = parsePage(sp.page);

  const digits = q.replace(/\D/g, "");
  const number = digits && digits.length <= 9 ? Number(digits) : undefined;

  const where = and(
    method ? eq(payments.method, method) : undefined,
    status ? eq(payments.status, status) : undefined,
    q ? (number !== undefined ? eq(orders.number, number) : sql`false`) : undefined
  );

  const [{ n: total }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .where(where);

  const rows: Row[] = await db
    .select({
      id: payments.id,
      orderId: orders.id,
      number: orders.number,
      channel: orders.channel,
      method: payments.method,
      status: payments.status,
      amountCents: payments.amountCents,
      providerRef: payments.providerRef,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .where(where)
    .orderBy(desc(payments.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const columns: Column<Row>[] = [
    { key: "date", label: "Date", render: (r) => dateTime(r.createdAt) },
    {
      key: "order",
      label: "Order",
      render: (r) =>
        r.channel === "pos" ? (
          <Link href={`/admin/pos/sales/${r.orderId}`} className={`rounded font-medium underline underline-offset-2 ${focus}`}>
            #{r.number}
          </Link>
        ) : (
          <span className="font-medium">#{r.number}</span>
        ),
    },
    { key: "method", label: "Method", render: (r) => METHOD_LABEL[r.method] ?? r.method },
    {
      key: "ref",
      label: "Reference",
      render: (r) => r.providerRef ?? <span className="text-[var(--dim)]">None</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge label={STATUS_LABEL[r.status]} tone={TONE[r.status]} />,
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (r) => <span className="font-semibold">{rand(r.amountCents)}</span>,
    },
  ];

  return (
    <main>
      <PageHeader title="Transactions" description="Every payment recorded at the till or on the website. Refunds are handled under Returns and refunds." />

      <TableToolbar
        action="/admin/transactions"
        searchLabel="Order number"
        searchPlaceholder="e.g. 1001"
        searchValue={q}
        filters={[
          {
            name: "method",
            label: "Method",
            value: method ?? "",
            options: METHODS.map((m) => ({ value: m, label: METHOD_LABEL[m] ?? m })),
          },
          {
            name: "status",
            label: "Status",
            value: status ?? "",
            options: STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })),
          },
        ]}
      />

      <DataTable
        caption="Payments, newest first"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        empty="No payments match."
      />

      <Pagination
        basePath="/admin/transactions"
        params={{ q: q || undefined, method, status }}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
      />
    </main>
  );
}