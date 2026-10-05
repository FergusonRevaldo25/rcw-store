import Link from "next/link";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const input = `min-h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] ${focus}`;
const label = "mb-1 block text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]";

export type ToolbarFilter = {
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
};

// A plain GET form, so it works without JavaScript and the URL can be shared.
export default function TableToolbar({
  action,
  searchName = "q",
  searchLabel,
  searchPlaceholder,
  searchValue,
  filters = [],
}: {
  action: string;
  searchName?: string;
  searchLabel: string;
  searchPlaceholder?: string;
  searchValue: string;
  filters?: ToolbarFilter[];
}) {
  const active = Boolean(searchValue) || filters.some((f) => f.value);

  return (
    <form
      method="get"
      action={action}
      role="search"
      className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
    >
      <div className="min-w-48 flex-1">
        <label htmlFor={searchName} className={label}>
          {searchLabel}
        </label>
        <input
          id={searchName}
          name={searchName}
          defaultValue={searchValue}
          placeholder={searchPlaceholder}
          maxLength={60}
          className={`${input} w-full`}
        />
      </div>

      {filters.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className={label}>
            {f.label}
          </label>
          <select id={f.name} name={f.name} defaultValue={f.value} className={input}>
            <option value="">All</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        type="submit"
        className={`min-h-11 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${focus}`}
      >
        Apply
      </button>
      {active && (
        <Link
          href={action}
          className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}
        >
          Clear
        </Link>
      )}
    </form>
  );
}