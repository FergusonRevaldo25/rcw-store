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
import { orders } from "@/lib/db/schema";
import { rand } from "@/lib/pos/money";
import { requirePermission } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "Orders | RCW Staff" };

const STATUSES = ["pending", "paid", "fulfilled", "cancelled"] as const;
const CHANNELS = ["pos", "online"] as const;
type Status = (typeof STATUSES)[number];
type Channel = (typeof CHANNELS)[number];

const STATUS_LABEL: Record<Status, string> = {
  pending: "Pending",
  paid: "Paid",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};
const TONE: Record<Status, "neutral" | "good" | "warn" | "bad"> = {
  pending: "warn",
  paid: "good",
  fulfilled: "good",
  cancelled: "bad",
};
const CHANNEL_LABEL: Record<Channel, string> = { pos: "Till", online: "Online" };

type Row = {
  id: string;
  number: number;
  channel: Channel;
  status: Status;
  customerName: string | null;
  totalCents: number;
  createdAt: Date;
};

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    channel?: string;
    page?: string;
  }>;
}) {
  await requirePermission("orders:view");
  const sp = await searchParams;

  const q = (sp.q ?? "").trim().slice(0, 60);
  const status = STATUSES.find((s) => s === sp.status);
  const channel = CHANNELS.find((c) => c === sp.channel);
  const page = parsePage(sp.page);

  // Search is by order number only for now: "1001" or "#1001".
  const digits = q.replace(/\D/g, "");
  const number = digits && digits.length <= 9 ? Number(digits) : undefined;

  const where = and(
    status ? eq(orders.status, status) : undefined,
    channel ? eq(orders.channel, channel) : undefined,
    q ? (number !== undefined ? eq(orders.number, number) : sql`false`) : undefined
  );

  const [{ n: total }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(orders)
    .where(where);

  const rows: Row[] = await db
    .select({
      id: orders.id,
      number: orders.number,
      channel: orders.channel,
      status: orders.status,
      customerName: orders.customerName,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const columns: Column<Row>[] = [
    {
      key: "number",
      label: "Order",
      render: (r) =>
        r.channel === "pos" ? (
          <Link
            href={`/admin/pos/receipt/${r.id}`}
            className={`rounded font-medium underline underline-offset-2 ${focus}`}
          >
            #{r.number}
          </Link>
        ) : (
          <span className="font-medium">#{r.number}</span>
        ),
    },
    { key: "date", label: "Date", render: (r) => dateTime(r.createdAt) },
    { key: "channel", label: "Channel", render: (r) => CHANNEL_LABEL[r.channel] },
    { key: "customer", label: "Customer", render: (r) => r.customerName ?? "Walk-in" },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge label={STATUS_LABEL[r.status]} tone={TONE[r.status]} />,
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      render: (r) => <span className="font-semibold">{rand(r.totalCents)}</span>,
    },
  ];

  return (
    <main>
      <PageHeader title="Orders" description="Every order from the till and the website." />

      <TableToolbar
        action="/admin/orders"
        searchLabel="Order number"
        searchPlaceholder="e.g. 1001"
        searchValue={q}
        filters={[
          {
            name: "status",
            label: "Status",
            value: status ?? "",
            options: STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })),
          },
          {
            name: "channel",
            label: "Channel",
            value: channel ?? "",
            options: CHANNELS.map((c) => ({ value: c, label: CHANNEL_LABEL[c] })),
          },
        ]}
      />

      <DataTable
        caption="Orders, newest first"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        empty="No orders match. Make a sale at the till and it will appear here."
      />

      <Pagination
        basePath="/admin/orders"
        params={{ q: q || undefined, status, channel }}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
      />
    </main>
  );
}