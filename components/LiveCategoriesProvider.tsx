"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { categoryMeta } from "@/lib/categoryMeta";

const staticLive: ReadonlySet<string> = new Set(
  categoryMeta.filter((c) => c.live).map((c) => c.slug)
);

const LiveCategoriesContext = createContext<ReadonlySet<string>>(staticLive);

export function LiveCategoriesProvider({
  slugs,
  children,
}: {
  slugs: string[];
  children: ReactNode;
}) {
  const set = useMemo<ReadonlySet<string>>(() => new Set(slugs), [slugs]);
  return (
    <LiveCategoriesContext.Provider value={set}>
      {children}
    </LiveCategoriesContext.Provider>
  );
}

// The category slugs that are switched on in the database.
export function useLiveCategories(): ReadonlySet<string> {
  return useContext(LiveCategoriesContext);
}