import Link from "next/link";

export default function StatCard({
  label,
  value,
  hint,
  href,
  attention = false,
}: {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
  attention?: boolean;
}) {
  const body = (
    <div
      className={`h-full rounded-xl border bg-[var(--surface)] p-5 transition-colors ${
        attention ? "border-fuchsia-500/50" : "border-[var(--border)]"
      } ${href ? "hover:border-[var(--border-strong)]" : ""}`}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-[var(--text)]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70 rounded-xl">
      {body}
    </Link>
  ) : (
    body
  );
}