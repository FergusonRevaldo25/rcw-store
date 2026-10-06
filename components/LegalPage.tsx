import type { ReactNode } from "react";
import InfoPage from "@/components/InfoPage";
import { LEGAL } from "@/lib/legal";

export const bullets = "list-disc space-y-1.5 pl-5";

export default function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <InfoPage title={title} intro={intro}>
      {!LEGAL.reviewed && (
        <p
          role="note"
          className="rounded-xl border border-orange-500/40 bg-orange-500/10 p-4 text-sm text-[var(--text)]"
        >
          <strong>Draft.</strong> This page is being finalised and may change
          before launch.
        </p>
      )}
      <p className="text-sm text-[var(--muted)]">
        Last updated: {LEGAL.lastUpdated}
      </p>
      {children}
    </InfoPage>
  );
}