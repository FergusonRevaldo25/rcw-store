"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function out() {
    setBusy(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
        onError: () => setBusy(false),
      },
    });
  }

  return (
    <button
      type="button"
      onClick={out}
      disabled={busy}
      className="min-h-11 rounded-full border border-[var(--border-strong)] px-6 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
    >
      {busy ? "Signing out..." : "Sign out"}
    </button>
  );
}