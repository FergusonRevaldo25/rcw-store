import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Server-only. Returns the current session, or null when signed out.
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

// Use at the top of a protected page. Redirects to sign-in when signed out
// and blocks suspended accounts.
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (session.user.status === "suspended") redirect("/sign-in?suspended=1");
  return session.user;
}