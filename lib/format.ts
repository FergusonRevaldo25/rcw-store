// Whole Rand show as R549, anything else as R249.50.
// Rounds to cents first so 19.99 * 3 never prints as 59.97000000000001.
export function formatRand(n: number): string {
  const r = Math.round(n * 100) / 100;
  return `R${Number.isInteger(r) ? r : r.toFixed(2)}`;
}