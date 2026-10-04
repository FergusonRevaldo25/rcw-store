"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { sellers } from "@/lib/db/schema";
import {
  validateSellerApplication,
  type SellerErrors,
  type SellerInput,
} from "@/lib/validation/seller";

export type ApplyState = {
  error?: string;
  errors?: SellerErrors;
  values?: SellerInput;
};

export async function applyAsSeller(
  _prev: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in before applying." };

  const parsed = validateSellerApplication(formData);
  if (!parsed.ok) return { errors: parsed.errors, values: parsed.values };

  const existing = await db
    .select({ id: sellers.id })
    .from(sellers)
    .where(eq(sellers.userId, session.user.id))
    .limit(1);
  if (existing.length) redirect("/seller");

  try {
    await db.insert(sellers).values({
      userId: session.user.id,
      ...parsed.data,
      termsAcceptedAt: new Date(),
    });
  } catch {
    return {
      error: "We could not save your application. Please try again.",
      values: parsed.data,
    };
  }

  redirect("/seller");
}