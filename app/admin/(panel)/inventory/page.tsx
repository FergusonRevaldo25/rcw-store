import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq, ilike, lte, gt, sql } from "drizzle-orm";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import Pagination from "@/components/admin/Pagination";
import StatusBadge from "@/components/admin/StatusBadge";
import TableToolbar from "@/components/admin/TableToolbar";
import { PAGE_SIZE, parsePage } from "@/lib/admin/table";
import { categoryScope, getVisibleCategoryIds } from "@/lib/catalogue/queries";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "Inventory | RCW Staff" };

// Default only. Confirm the real reorder level with the team.
const LOW_STOCK_AT = 10;

const LEVELS = ["low", "out", "ok"] as const;
const LEVEL_LABEL = {
  low: `Low (${LOW_STOCK_AT} or fewer)`,
  out: "Out of stock",
  ok: "In stock",
} as const;

type Row = {
  id: string;
  name: string;
  category: string;
  stock: number;
  status: string;
  sellerId: string | null;
};

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const like = (s: string) => `%${s.replace(/[\\%_]/g, "\\$&")}%`;

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; level?: string; page?: string }>;
}) {
  const staff = await requirePermission("inventory:view");
  const sp = await searchParams;

  const q = (sp.q ?? "").trim().slice(0, 60);
  const level = LEVELS.find((l) => l === sp.level);
  const page = parsePage(sp.page);
  const visible = await getVisibleCategoryIds(staff.user.id);

  const where = and(
    eq(products.trackStock, true),
    eq(products.isDigital, false),
    categoryScope(products.categoryId, visible),
    q ? ilike(products.name, like(q)) : undefined,
    level === "out" ? eq(products.stock, 0) : undefined,
    level === "low" ? and(gt(products.stock, 0), lte(products.stock, LOW_STOCK_AT)) : undefined,
    level === "ok" ? gt(products.stock, LOW_STOCK_AT) : undefined
  );

  const [{ n: total }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(products)
    .where(where);

  const rows: Row[] = await db
    .select({
      id: products.id,
      name: products.name,
      category: categories.name,
      stock: products.stock,
      status: products.status,
      sellerId: products.sellerId,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(where)
    .orderBy(asc(products.stock), asc(products.name))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const columns: Column<Row>[] = [
    {
      key: "name",
      label: "Product",
      render: (r) =>
        r.sellerId === null ? (
          <Link
            href={`/admin/products/${r.id}`}
            className={`rounded font-medium underline underline-offset-2 ${focus}`}
          >
            {r.name}
          </Link>
        ) : (
          <span className="font-medium">{r.name}</span>
        ),
    },
    { key: "category", label: "Category", render: (r) => r.category },
    { key: "owner", label: "Owner", render: (r) => (r.sellerId ? "Seller" : "RCW") },
    {
      key: "stock",
      label: "On hand",
      align: "right",
      render: (r) => <span className="font-semibold">{r.stock}</span>,
    },
    {
      key: "level",
      label: "Level",
      render: (r) =>
        r.stock === 0 ? (
          <StatusBadge label="Out of stock" tone="bad" />
        ) : r.stock <= LOW_STOCK_AT ? (
          <StatusBadge label="Low" tone="warn" />
        ) : (
          <StatusBadge label="In stock" tone="good" />
        ),
    },
  ];

  return (
    <main>
      <PageHeader
        title="Inventory"
        description="Physical products with stock tracking, lowest stock first. Adjust stock from the product page."
      />

      <TableToolbar
        action="/admin/inventory"
        searchLabel="Product name"
        searchValue={q}
        filters={[
          {
            name: "level",
            label: "Level",
            value: level ?? "",
            options: LEVELS.map((l) => ({ value: l, label: LEVEL_LABEL[l] })),
          },
        ]}
      />

      <DataTable
        caption="Stock levels, lowest first"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        empty="No tracked physical products match."
      />

      <Pagination
        basePath="/admin/inventory"
        params={{ q: q || undefined, level }}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
      />
    </main>
  );
}