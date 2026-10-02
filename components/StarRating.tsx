const STAR =
  "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9L12 2.5z";

function Row({ size }: { size: number }) {
  return (
    <span className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="shrink-0"
          aria-hidden="true"
        >
          <path d={STAR} />
        </svg>
      ))}
    </span>
  );
}

export default function StarRating({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(5, rating));

  return (
    <span
      role="img"
      aria-label={`${clamped.toFixed(1)} out of 5 stars`}
      className="relative inline-flex"
    >
      <span className="text-[var(--border-strong)]">
        <Row size={size} />
      </span>
      <span
        className="absolute inset-y-0 left-0 overflow-hidden text-amber-400"
        style={{ width: `${(clamped / 5) * 100}%` }}
      >
        <Row size={size} />
      </span>
    </span>
  );
}
