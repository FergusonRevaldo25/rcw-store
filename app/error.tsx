"use client";

import Link from "next/link";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-[60vh]">
      <div
        role="alert"
        className="mx-auto flex max-w-xl flex-col items-center px-6 py-16 text-center"
      >
        <h1 className="text-3xl font-extrabold rcw-gradient-text sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          An unexpected error happened on our side. Please try again.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className={`inline-flex min-h-10 items-center rounded-full bg-[var(--btn-bg)] px-5 py-2 text-sm font-semibold text-[var(--btn-fg)] ${focus}`}
          >
            Try again
          </button>
          <Link
            href="/"
            className={`inline-flex min-h-10 items-center rounded-full border border-[var(--border-strong)] px-5 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
