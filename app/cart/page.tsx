import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CartView from "@/components/CartView";

export const metadata: Metadata = {
  title: "Your cart | RCW Store",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl p-6">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Cart" }]}
        />
        <h1 className="mb-6 text-2xl font-bold text-[var(--text)] sm:text-3xl">
          Your cart
        </h1>
        <CartView />
      </div>
    </main>
  );
}
