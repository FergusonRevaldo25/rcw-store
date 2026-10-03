"use client";

import type { ReactNode } from "react";
import { AuthModalProvider } from "@/components/AuthModalProvider";
import { CartProvider } from "@/components/CartProvider";
import { FavouritesProvider } from "@/components/FavouritesProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <FavouritesProvider>
        <AuthModalProvider>{children}</AuthModalProvider>
      </FavouritesProvider>
    </CartProvider>
  );
}