export default function Loading() {
  return (
    <main className="min-h-[60vh]">
      <div role="status" aria-busy="true" className="mx-auto max-w-6xl p-6">
        <span className="sr-only">Loading</span>
        <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-[var(--surface)] motion-reduce:animate-none" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface)] motion-reduce:animate-none"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
