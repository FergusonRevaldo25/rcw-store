// 549 -> "R549", 249.5 -> "R249.50"
export function formatRand(amount: number): string {
  const n = Math.round(amount * 100) / 100;
  return Number.isInteger(n) ? `R${n}` : `R${n.toFixed(2)}`;
}