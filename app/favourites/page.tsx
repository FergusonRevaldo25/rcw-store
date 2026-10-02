import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import FavouritesView from "@/components/FavouritesView";

export const metadata: Metadata = {
  title: "Your favourites | RCW Store",
  robots: { index: false },
};

export default function FavouritesPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl p-6">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Favourites" }]}
        />
        <h1 className="mb-6 text-2xl font-bold text-[var(--text)] sm:text-3xl">
          Your favourites
        </h1>
        <FavouritesView />
      </div>
    </main>
  );
}
