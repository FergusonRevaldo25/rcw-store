import type { Metadata } from "next";
import { and, desc, ilike, isNotNull, or, sql } from "drizzle-orm";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import Pagination from "@/components/admin/Pagination";
import TableToolbar from "@/components/admin/TableToolbar";
import { dateTime, PAGE_SIZE, parsePage } from "@/lib/admin/table";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "Audit log | RCW Staff" };

type Row = {
  id: string;
  actorLabel: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  before: unknown;
  after: unknown;
  createdAt: Date;
};

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

// Stops % and _ typed by staff from acting as wildcards.
const like = (s: string) => `%${s.replace(/[\\%_]/g, "\\$&")}%`;

function Json({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="mt-2">
      <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
      <pre className="mt-1 max-w-[28rem] overflow-x-auto rounded-lg bg-[var(--bg)] p-2 text-xs text-[var(--text)]">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  await requirePermission("audit:view");
  const sp = await searchParams;

  const q = (sp.q ?? "").trim().slice(0, 60);
  const type = (sp.type ?? "").trim().slice(0, 40);
  const page = parsePage(sp.page);

  const typeRows = await db
    .selectDistinct({ t: auditLog.entityType })
    .from(auditLog)
    .where(isNotNull(auditLog.entityType))
    .orderBy(auditLog.entityType);
  const types = typeRows.map((r) => r.t).filter((t): t is string => !!t);

  const where = and(
    q
      ? or(ilike(auditLog.action, like(q)), ilike(auditLog.actorLabel, like(q)))
      : undefined,
    type && types.includes(type) ? sql`${auditLog.entityType} = ${type}` : undefined
  );

  const [{ n: total }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(auditLog)
    .where(where);

  const rows: Row[] = await db
    .select({
      id: auditLog.id,
      actorLabel: auditLog.actorLabel,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      before: auditLog.before,
      after: auditLog.after,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(where)
    .orderBy(desc(auditLog.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const columns: Column<Row>[] = [
    { key: "time", label: "When", render: (r) => dateTime(r.createdAt) },
    { key: "who", label: "Who", render: (r) => r.actorLabel ?? "System" },
    {
      key: "action",
      label: "Action",
      render: (r) => <span className="font-mono text-xs">{r.action}</span>,
    },
    {
      key: "item",
      label: "Item",
      render: (r) =>
        r.entityType ? (
          <span>
            {r.entityType}
            {r.entityId && (
              <span className="text-[var(--muted)]"> {r.entityId.slice(0, 8)}</span>
            )}
          </span>
        ) : (
          "n/a"
        ),
    },
    {
      key: "details",
      label: "Details",
      render: (r) =>
        r.before == null && r.after == null ? (
          <span className="text-[var(--dim)]">None</span>
        ) : (
          <details>
            <summary className={`cursor-pointer rounded underline underline-offset-2 ${focus}`}>
              Show
            </summary>
            <Json label="Before" value={r.before} />
            <Json label="After" value={r.after} />
          </details>
        ),
    },
  ];

  return (
    <main>
      <PageHeader
        title="Audit log"
        description="Who did what, and when. Entries are written by the system and are not edited here."
      />

      <TableToolbar
        action="/admin/audit-log"
        searchLabel="Action or email"
        searchPlaceholder="e.g. product.self_publish"
        searchValue={q}
        filters={[
          {
            name: "type",
            label: "Item type",
            value: types.includes(type) ? type : "",
            options: types.map((t) => ({ value: t, label: t })),
          },
        ]}
      />

      <DataTable
        caption="Audit log, newest first"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        empty="No entries match."
      />

      <Pagination
        basePath="/admin/audit-log"
        params={{ q: q || undefined, type: type || undefined }}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
      />
    </main>
  );
}