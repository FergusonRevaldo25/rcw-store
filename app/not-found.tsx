import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { categoryMeta } from "@/lib/categoryMeta";

export const metadata: Metadata = { title: "Page not found | RCW Store" };

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function NotFound() {
  const live = categoryMeta.filter((c) => c.live);

  return (
    <main className="min-h-[60vh]">
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-16 text-center">
        <Image
          src="/logo.png"
          alt=""
          width={96}
          height={96}
          className="h-24 w-24 rounded-full border border-[var(--border-strong)]"
        />
        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
          Error 404
        </p>
        <h1 className="mt-2 text-3xl font-extrabold rcw-gradient-text sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          The page you are looking for does not exist yet or has moved. Try one
          of these instead.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className={`inline-flex min-h-10 items-center rounded-full bg-[var(--btn-bg)] px-5 py-2 text-sm font-semibold text-[var(--btn-fg)] ${focus}`}
          >
            Back to home
          </Link>
          {live.map((c) => (
            <Link
              key={c.slug}
              href={`/products/${c.slug}`}
              className={`inline-flex min-h-10 items-center rounded-full border border-[var(--border-strong)] px-5 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}
            >
              Shop {c.name}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
