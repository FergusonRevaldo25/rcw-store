import type { ReactNode } from "react";

// A card section. Put a table inside and it is styled automatically.
export default function Panel({
  title,
  description,
  actions,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_32px_-16px_rgba(0,0,0,0.55)] ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/70 to-transparent"
      />
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div>
            {title && <h2 className="text-base font-semibold text-[var(--text)]">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-[var(--muted)]">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div
        className={[
          "overflow-x-auto",
          "[&_table]:w-full [&_table]:min-w-[640px] [&_table]:border-collapse [&_table]:text-sm",
          "[&_thead]:sticky [&_thead]:top-0 [&_thead]:bg-[var(--hover)]",
          "[&_th]:whitespace-nowrap [&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-widest [&_th]:text-[var(--muted)]",
          "[&_td]:px-5 [&_td]:py-3.5 [&_td]:text-[var(--text)]",
          "[&_tbody_tr]:border-t [&_tbody_tr]:border-[var(--border)] [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-[var(--hover)]",
        ].join(" ")}
      >
        {children}
      </div>
    </section>
  );
}