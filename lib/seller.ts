import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { sellers } from "@/lib/db/schema";

// Server-only. Use at the top of every seller page and seller server action.
export async function requireApprovedSeller() {
  const user = await requireUser();
  const [seller] = await db
    .select()
    .from(sellers)
    .where(eq(sellers.userId, user.id))
    .limit(1);

  if (!seller) redirect("/sell");
  if (seller.status !== "approved") redirect("/seller");
  return { user, seller };
}