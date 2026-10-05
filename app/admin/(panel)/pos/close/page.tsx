import type { Metadata } from "next";
import Link from "next/link";
import { and, count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import { db } from "@/lib/db";
import { orders, posSessions } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac/guard";
import { closeTill } from "../actions";

export const metadata: Metadata = { title: "Close till | RCW Staff" };

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default async function CloseTillPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const staff = await requirePermission("pos:create");
  const { notice } = await searchParams;

  const [session] = await db
    .select()
    .from(posSessions)
    .where(and(eq(posSessions.openedBy, staff.user.id), eq(posSessions.status, "open")));
  if (!session) redirect("/admin/pos");

  const [n] = await db
    .select({ n: count() })
    .from(orders)
    .where(eq(orders.posSessionId, session.id));

  return (
    <main className="max-w-md">
      <PageHeader
        title="Close your till"
        description={`${n?.n ?? 0} sales this session. Count all the cash in the drawer, including the float. The expected amount is shown after you submit.`}
      />
      {notice === "counted" && (
        <p role="alert" className="mb-4 rounded-lg border border-red-500/40 p-3 text-sm text-red-500">
          Enter the counted cash in Rand.
        </p>
      )}
      <form action={closeTill} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div>
          <label htmlFor="counted" className="mb-1.5 block text-sm font-medium text-[var(--text)]">Cash counted (Rand)</label>
          <input id="counted" name="counted" inputMode="decimal" required className={`min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] ${focus}`} />
        </div>
        <button type="submit" className={`min-h-11 w-full rounded-full bg-[var(--btn-bg)] px-6 text-sm font-semibold text-[var(--btn-fg)] ${focus}`}>
          Close till
        </button>
      </form>
      <Link href="/admin/pos" className={`mt-4 inline-block rounded text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)] ${focus}`}>
        Back to the till
      </Link>
    </main>
  );
}