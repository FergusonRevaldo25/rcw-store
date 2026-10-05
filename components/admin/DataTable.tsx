import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  label: string;
  align?: "right";
  render: (row: T) => ReactNode;
};

export default function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  empty = "Nothing to show yet.",
}: {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: string;
}) {
  const card =
    "relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_32px_-16px_rgba(0,0,0,0.55)]";
  const hairline = (
    <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-fuchsia-500/70 to-transparent" />
  );

  if (rows.length === 0) {
    return (
      <div className={card}>
        {hairline}
        <p role="status" className="px-6 py-14 text-center text-sm text-[var(--muted)]">
          {empty}
        </p>
      </div>
    );
  }

  return (
    <div className={card}>
      {hairline}
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 z-[5] bg-[var(--menu)]">
            <tr className="border-b border-[var(--border)]">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`whitespace-nowrap px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)] ${
                    c.align === "right" ? "text-right" : ""
                  }`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={rowKey(r)}
                className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--hover)]"
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-5 py-4 text-[var(--text)] ${
                      c.align === "right" ? "text-right tabular-nums" : ""
                    }`}
                  >
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}