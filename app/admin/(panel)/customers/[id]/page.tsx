import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import Panel from "@/components/admin/Panel";
import StatusBadge from "@/components/admin/StatusBadge";
import { dateTime } from "@/lib/admin/table";
import { db } from "@/lib/db";
import { orders, user } from "@/lib/db/schema";
import { rand } from "@/lib/pos/money";
import { requirePermission } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "Customer | RCW Staff" };

const focus = "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const TONE = { pending: "warn", paid: "good", fulfilled: "good", cancelled: "bad" } as const;

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await requirePermission("customers:view");

  const [c] = await db.select().from(user).where(eq(user.id, id));
  if (!c || c.kind !== "customer") notFound();

  const list = await db.select().from(orders).where(eq(orders.customerId, id)).orderBy(desc(orders.createdAt)).limit(50);
  const canOrders = staff.permissions.has("orders:view");

  return (
    <main className="mx-auto max-w-4xl space-y-6">
      <PageHeader title={c.name} description={`${c.email}, joined ${dateTime(c.createdAt)}, ${c.status}`} />
      <Panel title="Orders" description="Most recent 50">
        {list.length === 0 ? (
          <p className="p-5 text-sm text-[var(--muted)]">No orders yet.</p>
        ) : (
          <table>
            <thead><tr><th scope="col">Order</th><th scope="col">Date</th><th scope="col">Status</th><th scope="col" className="text-right">Total</th></tr></thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id}>
                  <td>
                    {canOrders ? (
                      <Link href={`/admin/orders/${o.id}`} className={`rounded underline underline-offset-2 ${focus}`}>#{o.number}</Link>
                    ) : (
                      <>#{o.number}</>
                    )}
                  </td>
                  <td>{dateTime(o.createdAt)}</td>
                  <td><StatusBadge label={o.status} tone={TONE[o.status]} /></td>
                  <td className="text-right">{rand(o.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
      <Link href="/admin/customers" className={`inline-block rounded text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}>Back to customers</Link>
    </main>
  );
}