import type { ReactNode } from "react";

export default function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <span aria-hidden="true" className="mb-3 block h-1 w-12 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500" />
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-[var(--muted)]">{description}</p>}
      </div>
      {actions}
    </div>
  );
}