"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/components/CartProvider";
import { FavouritesProvider } from "@/components/FavouritesProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <FavouritesProvider>{children}</FavouritesProvider>
    </CartProvider>
  );
}
