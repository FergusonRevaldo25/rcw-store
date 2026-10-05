"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { markFresh } from "@/lib/auth/fresh";
import { getStaff } from "@/lib/rbac/guard";

export type ConfirmState = { error?: string };

export async function confirmCode(_prev: ConfirmState, fd: FormData): Promise<ConfirmState> {
  const { user } = await getStaff();
  const code = String(fd.get("code") ?? "").trim();
  const rawNext = String(fd.get("next") ?? "");
  const next = rawNext.startsWith("/admin") && !rawNext.startsWith("//") ? rawNext : "/admin";

  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code from your authenticator app." };
  try {
    await auth.api.verifyTOTP({ body: { code }, headers: await headers() });
  } catch {
    return { error: "That code is not right. Wait for a new one and try again." };
  }
  await markFresh(user.id);
  redirect(next);
}