import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import PageHeader from "@/components/admin/PageHeader";
import PosTerminal, { type PosItem } from "@/components/admin/PosTerminal";
import { db } from "@/lib/db";
import { categories, orders, posSessions, productImages, products } from "@/lib/db/schema";
import { rand } from "@/lib/pos/money";
import { requirePermission } from "@/lib/rbac/guard";
import { openTill } from "./actions";

export const metadata: Metadata = { title: "Point of sale | RCW Staff" };

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const field = `min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] ${focus}`;

const notices: Record<string, string> = {
  float: "Enter a valid opening float in Rand. Use 0 if the till starts empty.",
  open: "You already have an open till, or it could not be opened.",
};

export default async function PosPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const staff = await requirePermission("pos:view");
  const canSell = staff.permissions.has("pos:create");
  const { notice } = await searchParams;

  const [session] = await db
    .select()
    .from(posSessions)
    .where(and(eq(posSessions.openedBy, staff.user.id), eq(posSessions.status, "open")));

  if (!canSell) {
    return (
      <main>
        <PageHeader title="Point of sale" />
        <p className="text-sm text-[var(--muted)]">You can view the point of sale but not make sales.</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="max-w-md">
        <PageHeader title="Open your till" description="Count the cash in the drawer and enter it as the opening float." />
        {notice && notices[notice] && (
          <p role="alert" className="mb-4 rounded-lg border border-red-500/40 p-3 text-sm text-red-500">{notices[notice]}</p>
        )}
        <form action={openTill} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div>
            <label htmlFor="till" className="mb-1.5 block text-sm font-medium text-[var(--text)]">Till name</label>
            <input id="till" name="till" defaultValue="Till 1" maxLength={30} className={field} />
          </div>
          <div>
            <label htmlFor="float" className="mb-1.5 block text-sm font-medium text-[var(--text)]">Opening float (Rand)</label>
            <input id="float" name="float" inputMode="decimal" defaultValue="0" className={field} />
          </div>
          <button type="submit" className={`min-h-11 w-full rounded-full bg-[var(--btn-bg)] px-6 text-sm font-semibold text-[var(--btn-fg)] ${focus}`}>
            Open till
          </button>
        </form>
      </main>
    );
  }

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      priceCents: products.priceCents,
      stock: products.stock,
      trackStock: products.trackStock,
      category: categories.name,
      image: productImages.url,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.position, 0)))
    .where(eq(products.status, "live"))
    .orderBy(products.name)
    .limit(300);

  const items: PosItem[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    priceCents: r.priceCents,
    stock: r.trackStock ? r.stock : null,
    image: r.image,
    category: r.category,
  }));

  const recent = await db
    .select({ id: orders.id, number: orders.number, total: orders.totalCents, at: orders.createdAt })
    .from(orders)
    .where(eq(orders.posSessionId, session.id))
    .orderBy(desc(orders.createdAt))
    .limit(8);

  return (
    <main>
      <PageHeader
        title="Point of sale"
        description={`${session.till}, opened ${session.openedAt.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}`}
        actions={
          <Link href="/admin/pos/close" className={`inline-flex min-h-10 items-center rounded-full border border-[var(--border-strong)] px-5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}>
            Close till
          </Link>
        }
      />
      <PosTerminal items={items} />

      {recent.length > 0 && (
        <section aria-labelledby="recent-h" className="mt-8">
          <h2 id="recent-h" className="mb-2 text-sm font-semibold text-[var(--text)]">Sales this session</h2>
          <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {recent.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/pos/receipt/${o.id}`} className={`flex items-center justify-between p-3 text-sm text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}>
                  <span>Order #{o.number}</span>
                  <span className="text-[var(--muted)]">{o.at.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="font-semibold">{rand(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}