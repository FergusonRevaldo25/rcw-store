import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sellers, user } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac/guard";
import { approveSeller, rejectSeller } from "./actions";

export const metadata: Metadata = { title: "Sellers | Admin" };

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default async function AdminSellersPage() {
  const staff = await requirePermission("sellers:view");
  const canApprove = staff.permissions.has("sellers:approve");

  const rows = await db
    .select({
      id: sellers.id,
      status: sellers.status,
      businessName: sellers.businessName,
      category: sellers.category,
      description: sellers.description,
      phone: sellers.contactPhone,
      createdAt: sellers.createdAt,
      rejectionReason: sellers.rejectionReason,
      email: user.email,
      name: user.name,
    })
    .from(sellers)
    .innerJoin(user, eq(user.id, sellers.userId))
    .orderBy(desc(sellers.createdAt));

  const sorted = [...rows].sort(
    (a, b) => Number(b.status === "pending") - Number(a.status === "pending")
  );

  return (
    <main>
      <h1 className="text-2xl font-bold text-[var(--text)]">Seller applications</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {rows.filter((r) => r.status === "pending").length} waiting for review.
      </p>

      {sorted.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">No applications yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {sorted.map((s) => (
            <li key={s.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-[var(--text)]">{s.businessName}</h2>
                  <p className="text-sm text-[var(--muted)]">
                    {s.name} ({s.email}), {s.phone}
                  </p>
                </div>
                <span className="rounded-full bg-[var(--hover)] px-3 py-1 text-xs font-semibold capitalize text-[var(--text)]">
                  {s.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--text)]">
                <span className="text-[var(--muted)]">Sells: </span>{s.category}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">{s.description}</p>
              {s.rejectionReason && (
                <p className="mt-2 text-sm text-[var(--muted)]">Reason given: {s.rejectionReason}</p>
              )}

              {canApprove && s.status !== "approved" && (
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <form action={approveSeller}>
                    <input type="hidden" name="sellerId" value={s.id} />
                    <button
                      type="submit"
                      className={`min-h-11 rounded-full bg-[var(--btn-bg)] px-6 py-2.5 text-sm font-semibold text-[var(--btn-fg)] ${focus}`}
                    >
                      Approve
                    </button>
                  </form>
                  <form action={rejectSeller} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="sellerId" value={s.id} />
                    <label className="sr-only" htmlFor={`reason-${s.id}`}>Rejection reason</label>
                    <input
                      id={`reason-${s.id}`}
                      name="reason"
                      required
                      minLength={5}
                      placeholder="Reason (min 5 characters)"
                      className={`min-h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] ${focus}`}
                    />
                    <button
                      type="submit"
                      className={`min-h-11 rounded-full border border-[var(--border-strong)] px-6 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}
                    >
                      Reject
                    </button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}