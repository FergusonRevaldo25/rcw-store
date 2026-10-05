import Link from "next/link";
import { buildHref } from "@/lib/admin/table";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const base = `inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold ${focus}`;

export default function Pagination({
  basePath,
  params,
  page,
  pageSize,
  total,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  pageSize: number;
  total: number;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-sm text-[var(--muted)]" role="status">
        {total === 0 ? "No results" : `Showing ${from} to ${to} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(basePath, { ...params, page: page - 1 })}
            rel="prev"
            className={`${base} border-[var(--border-strong)] text-[var(--text)] hover:bg-[var(--hover)]`}
          >
            Previous
          </Link>
        ) : (
          <span aria-disabled="true" className={`${base} border-[var(--border)] text-[var(--dim)]`}>
            Previous
          </span>
        )}
        <span className="px-2 text-sm text-[var(--muted)]">
          Page {page} of {pages}
        </span>
        {page < pages ? (
          <Link
            href={buildHref(basePath, { ...params, page: page + 1 })}
            rel="next"
            className={`${base} border-[var(--border-strong)] text-[var(--text)] hover:bg-[var(--hover)]`}
          >
            Next
          </Link>
        ) : (
          <span aria-disabled="true" className={`${base} border-[var(--border)] text-[var(--dim)]`}>
            Next
          </span>
        )}
      </div>
    </nav>
  );
}