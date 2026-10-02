import { readStorage, writeStorage } from "@/lib/storage";

const RECENT_KEY = "rcw-recent-v1";
const MAX_RECENT = 8;

export function readRecent(): string[] {
  const value = readStorage<unknown>(RECENT_KEY, []);
  return Array.isArray(value)
    ? value.filter((s): s is string => typeof s === "string")
    : [];
}

export function pushRecent(slug: string) {
  const next = [slug, ...readRecent().filter((s) => s !== slug)].slice(
    0,
    MAX_RECENT,
  );
  writeStorage(RECENT_KEY, next);
}

export function clearRecent() {
  writeStorage(RECENT_KEY, []);
}
