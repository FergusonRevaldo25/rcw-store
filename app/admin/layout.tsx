import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import PwaRegister from "@/components/admin/PwaRegister";

export const metadata: Metadata = {
  manifest: "/admin/manifest.webmanifest",
  applicationName: "RCW Staff",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#07060b" };

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PwaRegister />
      {children}
    </>
  );
}