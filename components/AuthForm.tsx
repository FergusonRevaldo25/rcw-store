"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import AuthPanel from "@/components/AuthPanel";

export default function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();

  return (
    <main className="min-h-[80vh]">
      <div className="mx-auto my-8 grid max-w-4xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] sm:my-12 md:grid-cols-2">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-700 via-fuchsia-600 to-orange-500 p-8 text-white md:flex">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-black/20 blur-2xl" />
          <Image
            src="/logo.png"
            alt=""
            width={56}
            height={56}
            className="relative h-14 w-14 rounded-full border border-white/40 object-cover"
          />
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
              RCW Store
            </p>
            <p className="mt-2 text-3xl font-extrabold leading-tight">
              Great deals. Cheap prices. Proudly South African.
            </p>
          </div>
        </aside>

        <div className="p-6 sm:p-8">
          <AuthPanel
            mode={mode}
            headingLevel={1}
            onSwitch={(m) => router.push(m === "sign-in" ? "/sign-in" : "/sign-up")}
            onDone={() => {
              router.push("/account");
              router.refresh();
            }}
          />
        </div>
      </div>
    </main>
  );
}