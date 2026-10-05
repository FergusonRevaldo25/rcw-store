"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditValues } from "@/lib/audit/log";
import { inScope } from "@/lib/catalogue/admin";
import { getVisibleCategoryIds } from "@/lib/catalogue/queries";
import { db } from "@/lib/db";
import { auditLog, categories } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac/guard";

// Switches a category on or off for the public site.
export async function setCategoryLive(fd: FormData): Promise<void> {
  const staff = await requirePermission("categories:edit");
  const id = String(fd.get("categoryId") ?? "");
  const live = fd.get("live") === "true";
  if (!id) redirect("/admin/categories?notice=missing");

  const visible = await getVisibleCategoryIds(staff.user.id);

  const outcome = await db.transaction(async (tx): Promise<string> => {
    const [c] = await tx
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .for("update");
    if (!c) return "missing";
    if (!inScope(visible, c.id)) return "scope";
    if (c.live === live) return "unchanged";

    await tx.update(categories).set({ live }).where(eq(categories.id, id));
    await tx.insert(auditLog).values(
      auditValues(
        staff.user,
        live ? "category.live" : "category.offline",
        "category",
        id,
        { live: c.live },
        { live, slug: c.slug }
      )
    );
    return live ? "on" : "off";
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect(`/admin/categories?notice=${outcome}`);
}