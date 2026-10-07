// Cleans an address from an environment variable. Returns undefined if it
// is empty or cannot be turned into a valid address.
export function cleanUrl(raw: string | undefined): string | undefined {
  const v = (raw ?? "").trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  if (!v) return undefined;
  const full = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    return new URL(full).origin;
  } catch {
    return undefined;
  }
}