import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SamplePageView from "@/components/admin/SamplePageView";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { SAMPLE_PAGES } from "@/lib/admin/sample-data";
import { requirePermission } from "@/lib/rbac/guard";

export const metadata: Metadata = { title: "RCW Staff" };

// Stand-in screens. A real route at the same path overrides this one.
export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string[] }>;
}) {
  const { section } = await params;
  const href = "/admin/" + section.join("/");

  const item = ADMIN_NAV.flatMap((g) => g.items).find((i) => i.href === href);
  const page = SAMPLE_PAGES[href];
  if (!item || !page) notFound();

  await requirePermission(item.permission);
  return <SamplePageView page={page} />;
}