type Tone = "neutral" | "good" | "warn" | "bad";

const DOT: Record<Tone, string> = {
  neutral: "bg-zinc-400",
  good: "bg-emerald-500",
  warn: "bg-amber-500",
  bad: "bg-red-500",
};

// The label carries the meaning; the dot is only decoration.
export default function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: Tone;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 py-0.5 text-xs font-medium text-[var(--text)]">
      <span aria-hidden="true" className={`size-2 rounded-full ${DOT[tone]}`} />
      {label}
    </span>
  );
}