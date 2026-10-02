export type Category =
  | "clothes"
  | "digital-products"
  | "software"
  | "skincare"
  | "perfume";

export interface Product {
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
}

export const activeCategories: Category[] = ["clothes", "digital-products"];

export const categoryLabels: Record<Category, string> = {
  clothes: "Clothes",
  "digital-products": "Digital Products",
  software: "Software",
  skincare: "Skincare",
  perfume: "Perfume",
};
