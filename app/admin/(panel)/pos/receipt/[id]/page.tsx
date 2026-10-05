import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import PrintButton from "@/components/admin/PrintButton";
import { db } from "@/lib/db";
import { orderItems, orders, payments, user } from "@/lib/db/schema";
import { rand } from "@/lib/pos/money";
import { BUSINESS, VAT } from "@/lib/pos/settings";
import { requirePermission } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "Receipt | RCW Staff" };

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const staff = await requirePermission("pos:view");

  const [o] = await db.select().from(orders).where(eq(orders.id, id));
  if (!o || o.channel !== "pos") notFound();
  const allowed =
    o.cashierId === staff.user.id ||
    staff.permissions.has("pos:approve") ||
    staff.permissions.has("orders:view");
  if (!allowed) notFound();

  const lines = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  const [pay] = await db.select().from(payments).where(eq(payments.orderId, id));
  const [cashier] = o.cashierId
    ? await db.select({ name: user.name }).from(user).where(eq(user.id, o.cashierId))
    : [];

  return (
    <main className="max-w-sm">
      <div id="receipt" className="rounded-xl bg-white p-6 font-mono text-sm text-black shadow">
        <p className="text-center text-base font-bold">{BUSINESS.name}</p>
        {BUSINESS.address && <p className="text-center text-xs">{BUSINESS.address}</p>}
        {VAT.registered && BUSINESS.vatNumber && (
          <p className="text-center text-xs">VAT no: {BUSINESS.vatNumber}</p>
        )}
        <hr className="my-3 border-dashed border-black/40" />
        <p>Order #{o.number}</p>
        <p>{o.createdAt.toLocaleString("en-ZA")}</p>
        {cashier && <p>Served by {cashier.name}</p>}
        <hr className="my-3 border-dashed border-black/40" />
        <ul className="space-y-1">
          {lines.map((l) => (
            <li key={l.id} className="flex justify-between gap-2">
              <span>{l.quantity} x {l.name}</span>
              <span>{rand(l.lineTotalCents)}</span>
            </li>
          ))}
        </ul>
        <hr className="my-3 border-dashed border-black/40" />
        {VAT.registered && (
          <p className="flex justify-between"><span>VAT included</span><span>{rand(o.vatCents)}</span></p>
        )}
        <p className="flex justify-between text-base font-bold"><span>Total</span><span>{rand(o.totalCents)}</span></p>
        {pay && <p className="mt-1 uppercase">Paid by {pay.method}</p>}
        <p className="mt-4 text-center text-xs">Thank you for shopping with us.</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <PrintButton />
        <Link href="/admin/pos" className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-strong)] px-6 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70">
          New sale
        </Link>
      </div>
    </main>
  );
}