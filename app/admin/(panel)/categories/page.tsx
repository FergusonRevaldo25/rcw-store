import type { Metadata } from "next";
import { asc, count, eq, sql } from "drizzle-orm";
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
  on: "Category switched on. Its live, in-stock products now show on the site.",
  off: "Category switched off. It now shows as coming soon.",
  unchanged: "Nothing changed. It was already in that state.",
  scope: "That category is outside the categories you have access to.",
  missing: "That category could not be found.",
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
      total: count(products.id),
      liveProducts: sql<number>`count(${products.id}) filter (where ${products.status} = 'live')`.mapWith(Number),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .where(categoryScope(categories.id, visible))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  const columns: Column<Row>[] = [
    {
      key: "name",
      label: "Category",
      render: (r) => (
        <div>
          <p className="font-medium text-[var(--text)]">{r.name}</p>
          <p className="text-xs text-[var(--muted)]">{r.slug}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "On the site",
      render: (r) => (
        <StatusBadge label={r.live ? "Live" : "Coming soon"} tone={r.live ? "good" : "neutral"} />
      ),
    },
    {
      key: "products",
      label: "Live products",
      align: "right",
      render: (r) =>
        !r.live && r.liveProducts === 0
          ? "None yet"
          : `${r.liveProducts} of ${r.total}`,
    },
    ...(canEdit
      ? [
          {
            key: "action",
            label: "Change",
            align: "right" as const,
            render: (r: Row) => (
              <form action={setCategoryLive}>
                <input type="hidden" name="categoryId" value={r.id} />
                <input type="hidden" name="live" value={String(!r.live)} />
                <button
                  type="submit"
                  aria-label={`${r.live ? "Switch off" : "Switch on"} ${r.name}`}
                  className={`min-h-10 rounded-full border border-[var(--border-strong)] px-5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}
                >
                  {r.live ? "Switch off" : "Switch on"}
                </button>
              </form>
            ),
          },
        ]
      : []),
  ];

  return (
    <main>
      <PageHeader
        title="Categories"
        description="A category must be switched on before its products show on the site."
      />

      {notice && NOTICES[notice] && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] p-3 text-sm text-[var(--text)]"
        >
          {NOTICES[notice]}
        </p>
      )}

      <DataTable
        caption="Categories and whether they are live on the site"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        empty="You have not been given any categories yet. Ask an admin to grant you access."
      />
    </main>
  );
}