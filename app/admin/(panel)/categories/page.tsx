import type { Metadata } from "next";
import { asc, eq, sql } from "drizzle-orm";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { categoryScope, getVisibleCategoryIds } from "@/lib/catalogue/queries";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac/guard";
import { setCategoryLive } from "./actions";

export const metadata: Metadata = { title: "Categories | RCW Staff" };

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

const NOTICES: Record<string, string> = {
  on: "Category is now on the storefront.",
  off: "Category is now off the storefront.",
  same: "No change was needed.",
  scope: "That category is outside the categories you have access to.",
  missing: "That category was not found.",
};

type Row = {
  id: string;
  name: string;
  slug: string;
  live: boolean;
  total: number;
  liveProducts: number;
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const staff = await requirePermission("categories:view");
  const { notice } = await searchParams;
  const canEdit = staff.permissions.has("categories:edit");
  const visible = await getVisibleCategoryIds(staff.user.id);

  const rows: Row[] = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      live: categories.live,
      total: sql<number>`count(${products.id})::int`,
      liveProducts: sql<number>`count(*) filter (where ${products.status} = 'live')::int`,
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .where(categoryScope(categories.id, visible))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  const columns: Column<Row>[] = [
    { key: "name", label: "Category", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "slug", label: "Address", render: (r) => <span className="font-mono text-xs">/products/{r.slug}</span> },
    { key: "total", label: "Products", align: "right", render: (r) => r.total },
    { key: "liveProducts", label: "Live products", align: "right", render: (r) => r.liveProducts },
    {
      key: "site",
      label: "On storefront",
      render: (r) =>
        r.live ? (
          <StatusBadge label="On" tone="good" />
        ) : (
          <StatusBadge label="Off (coming soon)" tone="neutral" />
        ),
    },
    {
      key: "action",
      label: "Action",
      render: (r) =>
        canEdit ? (
          <form action={setCategoryLive}>
            <input type="hidden" name="categoryId" value={r.id} />
            <input type="hidden" name="live" value={r.live ? "false" : "true"} />
            <button
              type="submit"
              aria-label={`${r.live ? "Turn off" : "Turn on"} ${r.name}`}
              className={`min-h-10 rounded-full border border-[var(--border-strong)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}
            >
              {r.live ? "Turn off" : "Turn on"}
            </button>
          </form>
        ) : (
          <span className="text-[var(--dim)]">View only</span>
        ),
    },
  ];

  return (
    <main>
      <PageHeader
        title="Categories"
        description="Choose which categories shoppers can browse. A category with no live products shows 'No products yet'."
      />

      {notice && NOTICES[notice] && (
        <p role="status" className="mb-4 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] p-3 text-sm text-[var(--text)]">
          {NOTICES[notice]}
        </p>
      )}

      <DataTable
        caption="Categories and whether they are on the storefront"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        empty="You have not been given any categories yet."
      />

      <p className="mt-4 text-xs text-[var(--muted)]">
        The storefront page for a category only exists if its address is also listed in
        lib/categoryMeta.ts. All 28 starter categories are.
      </p>
    </main>
  );
}