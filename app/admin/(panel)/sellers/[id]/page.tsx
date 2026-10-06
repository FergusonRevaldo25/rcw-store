import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import Panel from "@/components/admin/Panel";
import StatusBadge from "@/components/admin/StatusBadge";
import { dateTime } from "@/lib/admin/table";
import { db } from "@/lib/db";
import { products, sellers, user } from "@/lib/db/schema";
import { rand } from "@/lib/pos/money";
import { requirePermission } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "Seller | RCW Staff" };

const focus = "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("sellers:view");

  const [s] = await db
    .select({ s: sellers, name: user.name, email: user.email })
    .from(sellers)
    .innerJoin(user, eq(user.id, sellers.userId))
    .where(eq(sellers.id, id));
  if (!s) notFound();

  const list = await db.select().from(products).where(eq(products.sellerId, id)).orderBy(desc(products.updatedAt)).limit(50);

  return (
    <main className="mx-auto max-w-4xl space-y-6">
      <PageHeader title={s.s.businessName} description={`${s.name} (${s.email}), ${s.s.contactPhone}`} actions={<StatusBadge label={s.s.status} tone={s.s.status === "approved" ? "good" : s.s.status === "pending" ? "warn" : "bad"} />} />
      <Panel title="Application">
        <div className="space-y-2 p-5 text-sm text-[var(--text)]">
          <p><span className="text-[var(--muted)]">Sells: </span>{s.s.category}</p>
          <p className="text-[var(--muted)]">{s.s.description}</p>
          <p className="text-xs text-[var(--muted)]">Applied {dateTime(s.s.createdAt)}. Terms accepted {dateTime(s.s.termsAcceptedAt)}.</p>
          {s.s.rejectionReason && <p>Reason given: {s.s.rejectionReason}</p>}
        </div>
      </Panel>
      <Panel title="Products" description="Most recent 50">
        {list.length === 0 ? (
          <p className="p-5 text-sm text-[var(--muted)]">No products yet.</p>
        ) : (
          <table>
            <thead><tr><th scope="col">Product</th><th scope="col">Status</th><th scope="col" className="text-right">Price</th></tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}><td>{p.name}</td><td className="capitalize">{p.status.replace("_", " ")}</td><td className="text-right">{rand(p.priceCents)}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
      <Link href="/admin/sellers" className={`inline-block rounded text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}>Back to sellers</Link>
    </main>
  );
}