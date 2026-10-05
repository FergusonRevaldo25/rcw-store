"use server";

import { getProductsBySlugs, type StoreProduct } from "./storefront";

// Public catalogue data only. Used by client components that remember
// product slugs in the browser (recently viewed, and later favourites).
export async function fetchProductsBySlugs(
  slugs: string[]
): Promise<StoreProduct[]> {
  if (!Array.isArray(slugs)) return [];
  const clean = slugs
    .filter((s): s is string => typeof s === "string" && s.length > 0 && s.length <= 120)
    .slice(0, 24);
  return getProductsBySlugs(clean);
}