export type Review = {
  id: string;
  productSlug: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  body: string;
  date: string; // ISO date, e.g. "2026-10-02"
};

// Add REAL customer reviews here, with the customer's permission.
// Never add made-up reviews: that is misleading to shoppers.
export const reviews: Review[] = [];

export function getReviewsForProduct(slug: string): Review[] {
  return reviews.filter((r) => r.productSlug === slug);
}

export function summarize(list: Review[]) {
  const count = list.length;
  const average = count
    ? list.reduce((sum, r) => sum + r.rating, 0) / count
    : 0;
  return { average, count };
}
