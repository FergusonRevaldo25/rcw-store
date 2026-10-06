import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import Pagination from "@/components/admin/Pagination";
import TableToolbar from "@/components/admin/TableToolbar";
import { PAGE_SIZE, parsePage } from "@/lib/admin/table";
import { db } from "@/lib/db";
import { orders, user } from "@/lib/db/schema";
import { rand } from "@/lib/pos/money";
import { requirePermission } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "Customers | RCW Staff" };

const focus = "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const like = (s: string) => `%${s.replace(/[\\%_]/g, "\\$&")}%`;

type Row = { id: string; name: string; email: string; orders: number; spent: number };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requirePermission("customers:view");
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 60);
  const page = parsePage(sp.page);

  const where = and(
    eq(user.kind, "customer"),
    q ? or(ilike(user.name, like(q)), ilike(user.email, like(q))) : undefined
  );

  const [{ n: total }] = await db.select({ n: sql<number>`count(*)::int` }).from(user).where(where);

  const rows: Row[] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      orders: sql<number>`count(${orders.id})::int`,
      spent: sql<number>`coalesce(sum(case when ${orders.status} in ('paid','fulfilled') then ${orders.totalCents} else 0 end),0)::int`,
    })
    .from(user)
    .leftJoin(orders, eq(orders.customerId, user.id))
    .where(where)
    .groupBy(user.id)
    .orderBy(desc(user.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const columns: Column<Row>[] = [
    {
      key: "name",
      label: "Customer",
      render: (r) => (
        <>
          <Link href={`/admin/customers/${r.id}`} className={`rounded font-medium underline underline-offset-2 ${focus}`}>{r.name}</Link>
          <span className="block text-xs text-[var(--muted)]">{r.email}</span>
        </>
      ),
    },
    { key: "orders", label: "Orders", align: "right", render: (r) => r.orders },
    { key: "spent", label: "Spent", align: "right", render: (r) => <span className="font-semibold">{rand(r.spent)}</span> },
  ];

  return (
    <main>
      <PageHeader title="Customers" description="Accounts created on the website. Spend counts paid and fulfilled orders." />
      <TableToolbar action="/admin/customers" searchLabel="Name or email" searchValue={q} />
      <DataTable caption="Customers, newest first" columns={columns} rows={rows} rowKey={(r) => r.id} empty="No customers match." />
      <Pagination basePath="/admin/customers" params={{ q: q || undefined }} page={page} pageSize={PAGE_SIZE} total={total} />
    </main>
  );
}