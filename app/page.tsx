import CategoryShowcase from "@/components/CategoryShowcase";
import ProductCard from "@/components/ProductCard";
import AnimatedCard from "@/components/AnimatedCard";
import Reveal from "@/components/Reveal";
import HeroCarousel from "@/components/HeroCarousel";
import TrustStrip from "@/components/TrustStrip";
import FeaturedBrands from "@/components/FeaturedBrands";
import AdBanner from "@/components/AdBanner";
import HexCollage from "@/components/HexCollage";
import ShopByBudget from "@/components/ShopByBudget";
import VibeQuiz from "@/components/VibeQuiz";
import RandStretcher from "@/components/RandStretcher";
import MakerSpotlight from "@/components/MakerSpotlight";
import GrowWithUs from "@/components/GrowWithUs";
import RecentlyViewed from "@/components/RecentlyViewed";
import DeliveryChecker from "@/components/DeliveryChecker";
import { listProducts } from "@/lib/catalogue/storefront";

// Always fresh, so a POS sale shows on the site straight away.
export const dynamic = "force-dynamic";

export default async function Home() {
  // One query feeds the featured row and the interactive widgets.
  const catalogue = await listProducts({ limit: 24 });
  const featured = catalogue.slice(0, 8);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl space-y-10 p-6">
        <HeroCarousel />
        <TrustStrip />
        <FeaturedBrands />
        {featured.length > 0 && (
          <section>
            <Reveal>
              <h2 className="mb-4 text-xl font-bold text-[var(--text)]">
                Featured Products
              </h2>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {featured.map((p, i) => (
                <AnimatedCard key={p.slug} index={i}>
                  <ProductCard product={p} />
                </AnimatedCard>
              ))}
            </div>
          </section>
        )}
        <AdBanner />
        <ShopByBudget products={catalogue} />
        <HexCollage products={catalogue} />
        <CategoryShowcase />
        <RandStretcher products={catalogue} />
        <VibeQuiz products={catalogue} />
        <MakerSpotlight />
        <GrowWithUs />

        <RecentlyViewed />

        <DeliveryChecker />
      </div>
    </main>
  );
}
