import type { ReactNode } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function InfoPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: title }]}
        />
        <h1 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">
          {title}
        </h1>
        {intro && <p className="mt-3 text-[var(--muted)]">{intro}</p>}
        <div className="mt-8 space-y-8">{children}</div>
      </div>
    </main>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
      <div className="mt-2 space-y-3 leading-relaxed text-[var(--muted)]">
        {children}
      </div>
    </section>
  );
}