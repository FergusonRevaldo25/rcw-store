export const rand = (cents: number) => `R${(cents / 100).toFixed(2)}`;

// "249,99" or "249.99" to cents. Returns null when invalid.
export function parseRand(s: string): number | null {
  const t = s.replace(",", ".").trim();
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0 || n > 10_000_000) return null;
  return Math.round(n * 100);
}