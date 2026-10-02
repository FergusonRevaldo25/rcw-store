import { PAY_IN_PARTS } from "@/lib/config";

export default function PayInParts({ price }: { price: number }) {
  if (!PAY_IN_PARTS.enabled || price < PAY_IN_PARTS.min) return null;
  const each = (Math.ceil((price * 100) / PAY_IN_PARTS.parts) / 100).toFixed(2);
  return (
    <p className="mt-1 text-xs text-[var(--muted)]">
      or {PAY_IN_PARTS.parts} payments of R{each}
    </p>
  );
}
