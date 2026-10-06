import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq, isNull } from "drizzle-orm";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import { dateTime } from "@/lib/admin/table";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { rand } from "@/lib/pos/money";
import { requirePermission } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "Shipping | RCW Staff" };

const focus = "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

type Row = {
  id: string; number: number; name: string | null; city: string | null;
  province: string | null; postal: string | null; total: number; at: Date;
};

export default async function ShippingPage() {
  await requirePermission("shipping:view");

  const rows: Row[] = await db
    .select({
      id: orders.id, number: orders.number, name: orders.shippingName,
      city: orders.shippingCity, province: orders.shippingProvince,
      postal: orders.shippingPostalCode, total: orders.totalCents, at: orders.createdAt,
    })
    .from(orders)
    .where(and(eq(orders.channel, "online"), eq(orders.status, "paid"), isNull(orders.shippedAt)))
    .orderBy(asc(orders.createdAt))
    .limit(100);

  const columns: Column<Row>[] = [
    { key: "n", label: "Order", render: (r) => <Link href={`/admin/orders/${r.id}`} className={`rounded font-medium underline underline-offset-2 ${focus}`}>#{r.number}</Link> },
    { key: "d", label: "Paid order placed", render: (r) => dateTime(r.at) },
    { key: "c", label: "Deliver to", render: (r) => `${r.name ?? ""}, ${r.city ?? ""}, ${r.province ?? ""} ${r.postal ?? ""}` },
    { key: "t", label: "Total", align: "right", render: (r) => rand(r.total) },
  ];

  return (
    <main>
      <PageHeader title="Shipping" description={`${rows.length} paid online orders waiting to ship, oldest first. Open an order to add tracking.`} />
      <DataTable caption="Orders waiting to ship" columns={columns} rows={rows} rowKey={(r) => r.id} empty="Nothing is waiting to ship." />
    </main>
  );
}