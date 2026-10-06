import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CheckoutForm from "@/components/CheckoutForm";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Checkout | RCW Store",
  robots: { index: false },
};

export default async function CheckoutPage() {
  // Off until payments exist. Set CHECKOUT_ENABLED=true locally or on a preview.
  const enabled = process.env.CHECKOUT_ENABLED === "true";
  const session = enabled ? await getSession() : null;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl p-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
        />
        <h1 className="mb-6 text-2xl font-bold text-[var(--text)] sm:text-3xl">
          Checkout
        </h1>

        {enabled ? (
          <CheckoutForm
            defaultName={session?.user.name ?? ""}
            defaultEmail={session?.user.email ?? ""}
          />
        ) : (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <h2 className="text-lg font-semibold text-[var(--text)]">
              Checkout is not available yet
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Online ordering is being set up. Please check back soon.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
