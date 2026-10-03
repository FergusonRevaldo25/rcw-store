import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in | RCW Store" };

export default async function SignInPage() {
  if (await getSession()) redirect("/account");
  return <AuthForm mode="sign-in" />;
}