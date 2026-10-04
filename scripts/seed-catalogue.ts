import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { categories, productImages, products } from "../lib/db/schema";
import { categoryMeta } from "../lib/categoryMeta";
import { products as legacy } from "../lib/products";

// Safe to re-run. Copies categories and your existing products into the database.
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set in .env.local");
  console.log(`Host: ${new URL(url).host}`);

  const db = drizzle(neon(url));

  await db
    .insert(categories)
    .values(
      categoryMeta.map((c, i) => ({
        slug: c.slug,
        name: c.name,
        live: c.live,
        sortOrder: i,
      }))
    )
    .onConflictDoNothing({ target: categories.slug });
  console.log(`Categories: ${categoryMeta.length}`);

  const cats = await db.select().from(categories);
  const bySlug = new Map(cats.map((c) => [c.slug, c.id]));

  for (const p of legacy) {
    const categoryId = bySlug.get(p.category);
    if (!categoryId) {
      console.warn(`Skipped ${p.slug}: no category "${p.category}"`);
      continue;
    }

    await db
      .insert(products)
      .values({
        slug: p.slug,
        name: p.name,
        description: p.description,
        priceCents: Math.round(p.price * 100),
        categoryId,
        isDigital: p.category === "digital-products",
        // No real stock numbers yet, so stock is not tracked for these.
        trackStock: false,
        stock: 0,
        status: "live",
      })
      .onConflictDoNothing({ target: products.slug });

    const [row] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, p.slug));

    await db
      .insert(productImages)
      .values({ productId: row.id, url: p.image, alt: p.name, position: 0 })
      .onConflictDoNothing();

    console.log(`Product: ${p.slug}`);
  }
  console.log("Catalogue seed finished.");
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});