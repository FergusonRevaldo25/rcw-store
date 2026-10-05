// Small helpers shared by the admin list screens.

export const PAGE_SIZE = 25;

export function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n > 0 && n < 100000 ? n : 1;
}

// Builds /path?a=1&b=2 and leaves out empty values.
export function buildHref(
  base: string,
  params: Record<string, string | number | undefined>
): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && !(k === "page" && Number(v) === 1)) {
      q.set(k, String(v));
    }
  }
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

export const dateTime = (d: Date) =>
  d.toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });