// South African time, so server (UTC) and browser show the same clock.
export function fmtDate(d: Date | null | undefined): string {
  if (!d) return "n/a";
  return d.toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export const METHOD_LABEL: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  eft: "EFT",
  payfast: "PayFast",
  ozow: "Ozow",
};