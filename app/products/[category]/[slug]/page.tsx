import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import PayInParts from "@/components/PayInParts";
import ProductActions from "@/components/ProductActions";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import RecentlyViewedTracker from "@/components/RecentlyViewedTracker";
import { getProductBySlug, listProducts } from "@/lib/catalogue/storefront";
import { formatRand } from "@/lib/format";
import { categoryMeta } from "@/lib/categoryMeta";

type Props = { params: Promise<{ category: string; slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.category !== category) {
    return { title: "Product not found | RCW Store" };
  }

  return {
    title: `${product.name} | RCW Store`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { category, slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product || product.category !== category) notFound();

  const meta = categoryMeta.find((c) => c.slug === product.category);
  const categoryName = meta?.name ?? product.category;

  const related = await listProducts({
    categorySlug: product.category,
    excludeSlug: product.slug,
    limit: 4,
  });

  return (
    <main className="min-h-screen">
      <RecentlyViewedTracker slug={product.slug} />

      <div className="mx-auto max-w-6xl p-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: categoryName, href: `/products/${product.category}` },
            { label: product.name },
          ]}
        />

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--muted)]">
              {categoryName}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[var(--text)] sm:text-3xl">
              {product.name}
            </h1>

            <p className="mt-4 text-3xl font-bold text-[var(--text)]">
              {formatRand(product.price)}
            </p>
            <div className="mt-1">
              <PayInParts price={product.price} />
            </div>

            <p className="mt-5 leading-relaxed text-[var(--muted)]">
              {product.description}
            </p>

            <div className="mt-6">
              {product.inStock ? (
                // Digital products are bought once, so no quantity picker.
                <ProductActions
                  product={product}
                  showQuantity={!product.isDigital}
                />
              ) : (
                <p
                  role="status"
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]"
                >
                  This product is sold out right now. Please check back soon.
                </p>
              )}
            </div>
          </div>
        </div>

        <ProductReviews productSlug={product.slug} />

        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-14">
            <h2
              id="related-heading"
              className="mb-4 text-xl font-bold text-[var(--text)]"
            >
              More in {categoryName}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
