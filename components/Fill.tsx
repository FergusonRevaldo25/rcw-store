import type { ReactNode } from "react";

// Shows the value, or a visible placeholder when it has not been filled in.
export default function Fill({
  value,
  label,
}: {
  value: string | number | null | undefined;
  label: string;
}): ReactNode {
  if (value !== null && value !== undefined && value !== "") return <>{value}</>;
  return (
    <mark className="rounded bg-orange-500/20 px-1.5 py-0.5 text-sm font-medium text-orange-500">
      [{label}: add in lib/site.ts]
    </mark>
  );
}