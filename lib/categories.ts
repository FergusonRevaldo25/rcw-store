export interface CategoryDef {
  slug: string;
  label: string;
  active: boolean;
}

export const categories: CategoryDef[] = [
  { slug: "clothes", label: "Clothes", active: true },
  { slug: "digital-products", label: "Digital Products", active: true },
  { slug: "home-and-kitchen", label: "Home & Kitchen", active: false },
  { slug: "women-s-clothing", label: "Women's Clothing", active: false },
  { slug: "women-s-shoes", label: "Women's Shoes", active: false },
  { slug: "men-s-clothing", label: "Men's Clothing", active: false },
  { slug: "men-s-shoes", label: "Men's Shoes", active: false },
  { slug: "sports-and-outdoors", label: "Sports & Outdoors", active: false },
  {
    slug: "jewelry-and-accessories",
    label: "Jewelry & Accessories",
    active: false,
  },
  {
    slug: "beauty-and-personal-care",
    label: "Beauty & Personal Care",
    active: false,
  },
  { slug: "toys-and-games", label: "Toys & Games", active: false },
  { slug: "automotive", label: "Automotive", active: false },
  { slug: "baby-and-maternity", label: "Baby & Maternity", active: false },
  { slug: "bags-and-luggage", label: "Bags & Luggage", active: false },
  {
    slug: "patio-lawn-and-garden",
    label: "Patio, Lawn & Garden",
    active: false,
  },
  { slug: "electronics", label: "Electronics", active: false },
  {
    slug: "tools-and-home-improvement",
    label: "Tools & Home Improvement",
    active: false,
  },
  { slug: "appliances", label: "Appliances", active: false },
  {
    slug: "office-and-school-supplies",
    label: "Office & School Supplies",
    active: false,
  },
  { slug: "health-and-household", label: "Health & Household", active: false },
  { slug: "pet-supplies", label: "Pet Supplies", active: false },
  {
    slug: "cell-phones-and-accessories",
    label: "Cell Phones & Accessories",
    active: false,
  },
  { slug: "musical-instruments", label: "Musical Instruments", active: false },
  { slug: "books-and-media", label: "Books & Media", active: false },
  { slug: "furniture", label: "Furniture", active: false },
  { slug: "gaming", label: "Gaming", active: false },
  { slug: "groceries", label: "Groceries", active: false },
  { slug: "liquor", label: "Liquor", active: false },
];
