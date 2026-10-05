import type { ReactNode } from "react";

// Centers admin content and gives it breathing room.
export default function AdminContainer({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-80 bg-[radial-gradient(55%_70%_at_50%_0%,rgba(168,85,247,0.16),rgba(249,115,22,0.05)_55%,transparent)]"
      />
      {children}
    </div>
  );
}