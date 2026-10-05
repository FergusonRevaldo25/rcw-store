// Simple, responsive charts made from HTML and CSS. Each has a hidden table
// so screen reader users get the same numbers.

export type Point = { label: string; title: string; value: number };

export function DayBars({
  data,
  caption,
  format,
}: {
  data: Point[];
  caption: string;
  format: (n: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 0);
  if (max === 0) {
    return (
      <p role="status" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
        No sales in this period yet.
      </p>
    );
  }
  return (
    <figure className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div aria-hidden="true" className="flex h-44 items-end gap-1 sm:gap-1.5">
        {data.map((d) => (
          <div key={d.title} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${d.title}: ${format(d.value)}`}>
            <div
              className="w-full rounded-t bg-gradient-to-t from-violet-600 via-fuchsia-500 to-orange-500"
              style={{ height: `${d.value > 0 ? Math.max((d.value / max) * 100, 3) : 0}%` }}
            />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="mt-2 flex gap-1 sm:gap-1.5">
        {data.map((d) => (
          <span key={d.title} className="min-w-0 flex-1 text-center text-[10px] text-[var(--muted)]">
            {d.label}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{caption}</caption>
        <thead><tr><th scope="col">Day</th><th scope="col">Amount</th></tr></thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.title}><th scope="row">{d.title}</th><td>{format(d.value)}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function HBars({
  data,
  caption,
  format,
  empty,
}: {
  data: { label: string; value: number; note?: string }[];
  caption: string;
  format: (n: number) => string;
  empty: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 0);
  if (data.length === 0 || max === 0) {
    return <p role="status" className="text-sm text-[var(--muted)]">{empty}</p>;
  }
  return (
    <figure>
      <ul aria-label={caption} className="space-y-3">
        {data.map((d) => (
          <li key={d.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-[var(--text)]">{d.label}</span>
              <span className="shrink-0 font-semibold text-[var(--text)]">
                {format(d.value)}
                {d.note && <span className="ml-1 font-normal text-[var(--muted)]">{d.note}</span>}
              </span>
            </div>
            <div aria-hidden="true" className="mt-1 h-2 rounded-full bg-[var(--hover)]">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500"
                style={{ width: `${Math.max((d.value / max) * 100, 2)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}