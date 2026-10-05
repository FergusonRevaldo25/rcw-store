import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getStaff } from "@/lib/rbac/guard";

const COOKIE = "rcw_fresh";
const MINUTES = 10;

const sign = (v: string) =>
  createHmac("sha256", process.env.BETTER_AUTH_SECRET ?? "").update(v).digest("hex");

export async function markFresh(userId: string) {
  const v = `${userId}.${Date.now() + MINUTES * 60_000}`;
  (await cookies()).set(COOKIE, `${v}.${sign(v)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: MINUTES * 60,
  });
}

export async function isFresh(userId: string): Promise<boolean> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const i = raw.lastIndexOf(".");
  if (i < 0) return false;
  const v = raw.slice(0, i);
  const given = Buffer.from(raw.slice(i + 1));
  const want = Buffer.from(sign(v));
  if (given.length !== want.length || !timingSafeEqual(given, want)) return false;
  const j = v.lastIndexOf(".");
  return v.slice(0, j) === userId && Number(v.slice(j + 1)) > Date.now();
}

// Put this at the top of any sensitive server action.
// "next" is where staff land after confirming (then they click the button again).
export async function requireFresh(next: string) {
  const { user } = await getStaff();
  if (await isFresh(user.id)) return;
  redirect(`/admin/confirm?next=${encodeURIComponent(next)}`);
}