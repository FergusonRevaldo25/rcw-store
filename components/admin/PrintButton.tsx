"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="min-h-11 rounded-full bg-[var(--btn-bg)] px-6 text-sm font-semibold text-[var(--btn-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70"
    >
      Print receipt
    </button>
  );
}