import type { Metadata } from "next";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import AdminProductForm from "@/components/admin/AdminProductForm";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { inScope, isSuperAdmin, listAllowedCategories } from "@/lib/catalogue/admin";
import { getVisibleCategoryIds } from "@/lib/catalogue/queries";
import { db } from "@/lib/db";
import { categories, productImages, products, sellers } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac/guard";
import {
  adjustStock,
  publishOwn,
  submitForReview,
  takeOffline,
  updateAdminProduct,
} from "../actions";

export const metadata: Metadata = { title: "Product | RCW Staff" };

const NOTICES: Record<string, string> = {
  created: "Product saved as a draft. Add anything missing, then submit it for review.",
  submitted: "Submitted. Another staff member now needs to approve it.",
  published: "Published. The product is live and the audit log records it as a self-approval.",
  offline: "The product is back in drafts and no longer on the site.",
  stock: "Stock updated and recorded.",
  negative: "That would take stock below zero.",
  stockinput: "Enter a whole number that is not zero, and choose a reason.",
};

const STATUS: Record<string, { label: string; tone: "neutral" | "good" | "warn" | "bad" }> = {
  draft: { label: "Draft", tone: "neutral" },
  pending_review: { label: "Waiting for review", tone: "warn" },
  live: { label: "Live", tone: "good" },
  rejected: { label: "Rejected", tone: "bad" },
};

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const primary = `min-h-11 rounded-full bg-[var(--btn-bg)] px-6 py-2.5 text-sm font-semibold text-[var(--btn-fg)] hover:opacity-90 ${focus}`;
const secondary = `min-h-11 rounded-full border border-[var(--border-strong)] px-6 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] ${focus}`;
const input =
  "min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { id } = await params;
  const { notice } = await searchParams;
  const staff = await requirePermission("products:view");
  const visible = await getVisibleCategoryIds(staff.user.id);

  const [row] = await db
    .select({ p: products, categoryName: categories.name, sellerName: sellers.businessName })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(sellers, eq(sellers.id, products.sellerId))
    .where(eq(products.id, id));
  if (!row || !inScope(visible, row.p.categoryId)) notFound();
  const p = row.p;

  const [img] = await db
    .select({ url: productImages.url })
    .from(productImages)
    .where(and(eq(productImages.productId, id), eq(productImages.position, 0)));

  const cats = await listAllowedCategories(visible);

  const mine = p.createdBy === staff.user.id;
  const reviewer = staff.permissions.has("products:edit");
  const rcw = p.sellerId === null;
  const open = p.status === "draft" || p.status === "rejected";

  const editable = rcw && open && staff.permissions.has("products:create") && (mine || reviewer);
  const canSelfPublish =
    rcw && mine && (open || p.status === "pending_review") && (await isSuperAdmin(staff.user.id));
  const canTakeOffline =
    (p.status === "live" && reviewer) ||
    (p.status === "pending_review" && (mine || reviewer));
  const canAdjust =
    rcw && p.status === "live" && p.trackStock && !p.isDigital &&
    (reviewer || staff.permissions.has("inventory:edit"));

  const s = STATUS[p.status] ?? STATUS.draft;

  return (
    <main className="max-w-2xl">
      <PageHeader
        title={p.name}
        description={`${row.categoryName}, ${rcw ? "RCW product" : `seller: ${row.sellerName ?? "unknown"}`}`}
        actions={<StatusBadge label={s.label} tone={s.tone} />}
      />

      {notice && NOTICES[notice] && (
        <p role="status" className="mb-4 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] p-3 text-sm text-[var(--text)]">
          {NOTICES[notice]}
        </p>
      )}

      {p.status === "rejected" && p.rejectionReason && (
        <p role="alert" className="mb-4 rounded-lg border border-red-500/40 p-3 text-sm text-red-500">
          Rejected: {p.rejectionReason}
        </p>
      )}

      {!rcw && (
        <p className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--muted)]">
          This is a seller product. The seller edits it from their own account.
        </p>
      )}

      <AdminProductForm
        action={updateAdminProduct.bind(null, id)}
        categories={cats}
        readOnly={!editable}
        submitLabel="Save changes"
        initial={{
          name: p.name,
          description: p.description,
          priceRand: (p.priceCents / 100).toFixed(2),
          categoryId: p.categoryId,
          image: img?.url ?? "",
          stock: String(p.stock),
          isDigital: p.isDigital,
          trackStock: p.trackStock,
        }}
      />

      {(editable || canSelfPublish || canTakeOffline) && (
        <section aria-labelledby="actions-h" className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 id="actions-h" className="text-lg font-semibold text-[var(--text)]">
            What next
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Save your changes before using these buttons.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {editable && (
              <form action={submitForReview}>
                <input type="hidden" name="productId" value={id} />
                <button type="submit" className={primary}>Submit for review</button>
              </form>
            )}
            {canSelfPublish && (
              <form action={publishOwn}>
                <input type="hidden" name="productId" value={id} />
                <button type="submit" className={secondary}>Publish now (Super Admin)</button>
              </form>
            )}
            {canTakeOffline && (
              <form action={takeOffline}>
                <input type="hidden" name="productId" value={id} />
                <button type="submit" className={secondary}>
                  {p.status === "live" ? "Take offline" : "Withdraw from review"}
                </button>
              </form>
            )}
          </div>
          {canSelfPublish && (
            <p className="mt-3 text-xs text-[var(--dim)]">
              Publishing your own product skips review. It is recorded in the audit log as a self-approval.
            </p>
          )}
        </section>
      )}

      {canAdjust && (
        <section aria-labelledby="stock-h" className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 id="stock-h" className="text-lg font-semibold text-[var(--text)]">
            Adjust stock
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            On hand now: {p.stock}. Use a negative number to remove stock. Every change is recorded.
          </p>
          <form action={adjustStock} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="productId" value={id} />
            <div>
              <label htmlFor="delta" className="mb-1 block text-sm text-[var(--muted)]">Change (e.g. 10 or -2)</label>
              <input id="delta" name="delta" inputMode="numeric" required className={input} />
            </div>
            <div>
              <label htmlFor="reason" className="mb-1 block text-sm text-[var(--muted)]">Reason</label>
              <select id="reason" name="reason" defaultValue="restock" className={input}>
                <option value="restock">New stock received</option>
                <option value="count">Stock count correction</option>
                <option value="adjustment">Damaged, lost or other</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="note" className="mb-1 block text-sm text-[var(--muted)]">Note (optional)</label>
              <input id="note" name="note" maxLength={200} className={input} />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className={primary}>Record stock change</button>
            </div>
          </form>
        </section>
      )}

      <Link
        href="/admin/products"
        className="mt-6 inline-block rounded text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)]"
      >
        Back to products
      </Link>
    </main>
  );
}