import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";

// Category slugs that are switched on in the database.
export const getLiveCategorySlugs = cache(async (): Promise<Set<string>> => {
  const rows = await db
    .select({ slug: categories.slug })
    .from(categories)
    .where(eq(categories.live, true));
  return new Set(rows.map((r) => r.slug));
});