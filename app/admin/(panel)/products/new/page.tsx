import type { Metadata } from "next";
import Link from "next/link";
import AdminProductForm from "@/components/admin/AdminProductForm";
import PageHeader from "@/components/admin/PageHeader";
import Panel from "@/components/admin/Panel";
import { listAllowedCategories } from "@/lib/catalogue/admin";
import { getVisibleCategoryIds } from "@/lib/catalogue/queries";
import { requirePermission } from "@/lib/rbac/guard";
import { createAdminProduct } from "../actions";

export const metadata: Metadata = { title: "New product | RCW Staff" };

export default async function NewProductPage() {
  const staff = await requirePermission("products:create");
  const visible = await getVisibleCategoryIds(staff.user.id);
  const categories = await listAllowedCategories(visible);

  return (
    <main className="mx-auto max-w-3xl">
      <PageHeader
        title="New product"
        description="It starts as a draft. Nothing shows on the site until it is approved."
      />

      <Panel title="Product details">
        <div className="p-5 sm:p-6">
          {categories.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              You have not been given any categories yet. Ask an admin to grant you access.
            </p>
          ) : (
            <AdminProductForm
              action={createAdminProduct}
              categories={categories}
              submitLabel="Save as draft"
            />
          )}
        </div>
      </Panel>

      <Link
        href="/admin/products"
        className="mt-6 inline-block rounded text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)]"
      >
        Back to products
      </Link>
    </main>
  );
}