import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { categoryMeta } from "@/lib/categoryMeta";

async function readLive(): Promise<string[]> {
  const rows = await db
    .select({ slug: categories.slug })
    .from(categories)
    .where(eq(categories.live, true));
  return rows.map((r) => r.slug);
}

// Fresh on every request. For pages that are already dynamic.
export const getLiveCategorySlugs = cache(
  async (): Promise<Set<string>> => new Set(await readLive())
);

const readLiveCached = unstable_cache(readLive, ["live-category-slugs"], {
  revalidate: 60,
});

// For the header and footer, which sit on every page. Cached for a minute so
// ordinary page views do not wake the database. If the database cannot be
// reached (for example during a build), it falls back to the static flags.
export async function getLiveSlugsForChrome(): Promise<string[]> {
  try {
    return await readLiveCached();
  } catch {
    return categoryMeta.filter((c) => c.live).map((c) => c.slug);
  }
}