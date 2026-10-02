import StarRating from "@/components/StarRating";
import { getReviewsForProduct, summarize } from "@/lib/reviews";

export default function ProductReviews({
  productSlug,
}: {
  productSlug: string;
}) {
  const list = getReviewsForProduct(productSlug);
  const { average, count } = summarize(list);

  return (
    <section aria-labelledby="reviews-heading" className="mt-14">
      <h2
        id="reviews-heading"
        className="mb-4 text-xl font-bold text-[var(--text)]"
      >
        Customer reviews
      </h2>

      {count === 0 ? (
        <p className="text-sm text-[var(--muted)]">No reviews yet.</p>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-3">
            <StarRating rating={average} size={20} />
            <p className="text-sm text-[var(--muted)]">
              {average.toFixed(1)} out of 5 ({count}{" "}
              {count === 1 ? "review" : "reviews"})
            </p>
          </div>

          <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {list.map((r) => (
              <li key={r.id} className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <StarRating rating={r.rating} />
                  {r.title && (
                    <h3 className="font-semibold text-[var(--text)]">
                      {r.title}
                    </h3>
                  )}
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{r.body}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {r.author},{" "}
                  {new Date(r.date).toLocaleDateString("en-ZA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
