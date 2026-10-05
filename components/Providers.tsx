"use client";

import type { ReactNode } from "react";
import { AuthModalProvider } from "@/components/AuthModalProvider";
import { CartProvider } from "@/components/CartProvider";
import { FavouritesProvider } from "@/components/FavouritesProvider";
import { LiveCategoriesProvider } from "@/components/LiveCategoriesProvider";

export default function Providers({
  children,
  liveSlugs,
}: {
  children: ReactNode;
  liveSlugs: string[];
}) {
  return (
    <LiveCategoriesProvider slugs={liveSlugs}>
      <CartProvider>
        <FavouritesProvider>
          <AuthModalProvider>{children}</AuthModalProvider>
        </FavouritesProvider>
      </CartProvider>
    </LiveCategoriesProvider>
  );
}