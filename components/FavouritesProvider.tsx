"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { readStorage, writeStorage } from "@/lib/storage";

type FavouritesContextValue = {
  slugs: string[];
  count: number;
  hydrated: boolean;
  isFavourite: (slug: string) => boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
};

const FavouritesContext = createContext<FavouritesContextValue | null>(null);
const STORAGE_KEY = "rcw-favourites-v1";

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSlugs(readStorage<string[]>(STORAGE_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEY, slugs);
  }, [slugs, hydrated]);

  const isFavourite = useCallback(
    (slug: string) => slugs.includes(slug),
    [slugs],
  );

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setSlugs((prev) => prev.filter((s) => s !== slug));
  }, []);

  const value = useMemo<FavouritesContextValue>(
    () => ({
      slugs,
      count: slugs.length,
      hydrated,
      isFavourite,
      toggle,
      remove,
    }),
    [slugs, hydrated, isFavourite, toggle, remove],
  );

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx)
    throw new Error("useFavourites must be used inside <FavouritesProvider>");
  return ctx;
}
