import Link from "next/link";
import { useId } from "react";

function Sparkline({ data }: { data: number[] }) {
  const id = useId();
  if (data.length < 2) return null;
  const w = 120;
  const h = 36;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = max === min ? h / 2 : h - 4 - ((v - min) / span) * (h - 8);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-full" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${id}-s`} x1="0" x2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="55%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id={`${id}-f`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#d946ef" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#d946ef" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w} ${h} L0 ${h} Z`} fill={`url(#${id}-f)`} />
      <path d={line} fill="none" stroke={`url(#${id}-s)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function StatCard({
  label,
  value,
  hint,
  href,
  attention = false,
  trend,
  spark,
}: {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
  attention?: boolean;
  trend?: { text: string; up: boolean };
  spark?: number[];
}) {
  const body = (
    <div
      className={`group relative h-full overflow-hidden rounded-2xl border bg-[var(--surface)] p-5 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.6)] transition-all duration-200 ${
        attention ? "border-fuchsia-500/50" : "border-[var(--border)]"
      } ${href ? "hover:-translate-y-0.5 hover:border-[var(--border-strong)]" : ""}`}
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/60 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">{label}</p>
        {trend && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              trend.up ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"
            }`}
          >
            {trend.up ? "Up" : "Down"} {trend.text}
          </span>
        )}
      </div>
      <p className="mt-3 bg-gradient-to-r from-[var(--text)] to-[var(--text)] bg-clip-text text-3xl font-extrabold tracking-tight text-[var(--text)]">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>}
      {spark && <div className="mt-3"><Sparkline data={spark} /></div>}
    </div>
  );
  return href ? (
    <Link href={href} className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70">
      {body}
    </Link>
  ) : (
    body
  );
}