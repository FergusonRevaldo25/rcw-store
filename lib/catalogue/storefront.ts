import { and, asc, eq, gt, ilike, inArray, ne, or } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { categories, productImages, products } from "@/lib/db/schema";
import type { Product } from "@/types/product";

// The same shape the storefront components already use, plus a few fields.
export type StoreProduct = Product & {
  id: string;
  isDigital: boolean;
  inStock: boolean;
};

const FALLBACK_IMAGE = "/logo.png";
// Temporary: images for the first four products until they have uploaded images.
const staticImage = new Map<string, string>([
  ["rcw-hoodie-black", "/products/hoodie-black.jpg"],
  ["rcw-tshirt-white", "/products/tshirt-white.jpg"],
  ["invoice-template-pack", "/products/invoice-templates.jpg"],
  ["social-media-kit", "/products/social-kit.jpg"],
]);

const columns = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  description: products.description,
  priceCents: products.priceCents,
  isDigital: products.isDigital,
  trackStock: products.trackStock,
  stock: products.stock,
  categorySlug: categories.slug,
};

function baseQuery() {
  return db
    .select(columns)
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId));
}
type Row = Awaited<ReturnType<typeof baseQuery>>[number];

// Only approved products in categories that are switched on.
const visible = and(eq(products.status, "live"), eq(categories.live, true));
const inStockCond = or(eq(products.trackStock, false), gt(products.stock, 0));

async function hydrate(rows: Row[]): Promise<StoreProduct[]> {
  if (rows.length === 0) return [];

  const imgs = await db
    .select({ productId: productImages.productId, url: productImages.url })
    .from(productImages)
    .where(inArray(productImages.productId, rows.map((r) => r.id)))
    .orderBy(asc(productImages.position));

  const first = new Map<string, string>();
  for (const i of imgs) if (!first.has(i.productId)) first.set(i.productId, i.url);

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.categorySlug,
    // The database holds cents; the storefront shows Rand.
    price: r.priceCents / 100,
    description: r.description,
    image: first.get(r.id) ?? staticImage.get(r.slug) ?? FALLBACK_IMAGE,
    isDigital: r.isDigital,
    inStock: !r.trackStock || r.stock > 0,
  }));
}

export async function listProducts(
  opts: { categorySlug?: string; excludeSlug?: string; limit?: number } = {}
): Promise<StoreProduct[]> {
  const conds = [visible, inStockCond];
  if (opts.categorySlug) conds.push(eq(categories.slug, opts.categorySlug));
  if (opts.excludeSlug) conds.push(ne(products.slug, opts.excludeSlug));

  const rows = await baseQuery()
    .where(and(...conds))
    .orderBy(asc(products.createdAt), asc(products.name))
    .limit(Math.min(opts.limit ?? 48, 100));
  return hydrate(rows);
}

// Every word must appear in the name, description or category name.
export async function searchProducts(q: string, limit = 48): Promise<StoreProduct[]> {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 6);
  if (words.length === 0) return [];

  const wordConds = words.map((w) => {
    const like = `%${w.replace(/[\\%_]/g, "\\$&")}%`;
    return or(
      ilike(products.name, like),
      ilike(products.description, like),
      ilike(categories.name, like)
    );
  });

  const rows = await baseQuery()
    .where(and(visible, inStockCond, ...wordConds))
    .orderBy(asc(products.name))
    .limit(limit);
  return hydrate(rows);
}

// Not filtered by stock, so a sold-out product page still opens.
export const getProductBySlug = cache(
  async (slug: string): Promise<StoreProduct | null> => {
    const rows = await baseQuery()
      .where(and(visible, eq(products.slug, slug)))
      .limit(1);
    const [p] = await hydrate(rows);
    return p ?? null;
  }
);

export async function getProductsBySlugs(
  slugs: string[],
  onlyInStock = true
): Promise<StoreProduct[]> {
  if (slugs.length === 0) return [];
  const conds = [visible, inArray(products.slug, slugs)];
  if (onlyInStock) conds.push(inStockCond);

  const list = await hydrate(await baseQuery().where(and(...conds)));
  const order = new Map(slugs.map((s, i) => [s, i]));
  return list.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
}