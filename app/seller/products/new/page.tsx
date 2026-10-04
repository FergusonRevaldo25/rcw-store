import type { Metadata } from "next";
import Link from "next/link";
import SellerProductForm from "@/components/SellerProductForm";
import { listLiveCategories } from "@/lib/catalogue/queries";
import { requireApprovedSeller } from "@/lib/seller";
import { createProduct } from "../actions";

export const metadata: Metadata = { title: "Add product | Seller" };

export default async function NewProductPage() {
  await requireApprovedSeller();
  const categories = await listLiveCategories();

  return (
    <main className="min-h-[60vh]">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/seller/products" className="text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)]">
          Back to my products
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-[var(--text)]">Add product</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          It is saved as a draft. You submit it for review when it is ready.
        </p>
        <SellerProductForm action={createProduct} categories={categories} submitLabel="Save draft" />
      </div>
    </main>
  );
}