import PageHeader from "@/components/admin/PageHeader";
import type { SamplePage } from "@/lib/admin/sample-data";

export default function SamplePageView({ page }: { page: SamplePage }) {
  return (
    <main>
      <PageHeader title={page.title} description={page.description} />

      <p
        role="note"
        className="mb-6 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] p-3 text-sm text-[var(--muted)]"
      >
        Sample data. Everything on this page is made up so the screen has something to show.
        It will be replaced with real data when this section is built.
      </p>

      <dl className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {page.stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <dt className="text-sm text-[var(--muted)]">{s.label}</dt>
            <dd className="mt-1 text-2xl font-bold text-[var(--text)]">{s.value}</dd>
            {s.hint && <p className="mt-1 text-xs text-[var(--dim)]">{s.hint}</p>}
          </div>
        ))}
      </dl>

      <section aria-labelledby="table-h">
        <h2 id="table-h" className="mb-2 text-sm font-semibold text-[var(--text)]">
          {page.tableTitle}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                {page.columns.map((c) => (
                  <th key={c} scope="col" className="px-4 py-3 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.rows.map((r, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0">
                  {r.map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-[var(--text)]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}