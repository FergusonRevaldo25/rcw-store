import Link from "next/link";
import { categories } from "@/lib/categories";

export default function CategoryCard({ slug }: { slug: string }) {
  const category = categories.find((c) => c.slug === slug);
  if (!category) return null;

  if (!category.active) {
    return (
      <div className="border border-gray-800 rounded-xl p-6 text-center bg-gray-900/30 opacity-60">
        <h3 className="text-white font-semibold text-sm">{category.label}</h3>
        <p className="text-gray-500 text-xs mt-1">Coming Soon</p>
      </div>
    );
  }

  return (
    <Link
      href={`/products/${category.slug}`}
      className="block border border-gray-800 rounded-xl p-6 text-center bg-gray-900/50 hover:border-gray-600 transition"
    >
      <h3 className="rcw-gradient-text font-bold text-sm">{category.label}</h3>
      <p className="text-gray-400 text-xs mt-1">Shop now</p>
    </Link>
  );
}
