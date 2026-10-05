export type CategoryItem = { name: string };
export type CategoryMeta = {
  name: string;
  slug: string;
  live: boolean;
  items?: CategoryItem[];
};

// Live categories first, then the rest alphabetically.
// Flip `live` to true when a category gets products.
export const categoryMeta: CategoryMeta[] = [
  {
    name: "Clothes",
    slug: "clothes",
    live: true,
    items: [
      { name: "Hoodies" },
      { name: "T-Shirts" },
      { name: "Caps" },
      { name: "Joggers" },
    ],
  },
  {
    name: "Digital Products",
    slug: "digital-products",
    live: true,
    items: [
      { name: "Invoice Templates" },
      { name: "Social Media Kits" },
      { name: "Logos & Branding" },
      { name: "E-books" },
    ],
  },
  {
    name: "Electronics",
    slug: "electronics",
    live: false,
    items: [
      { name: "Earbuds" },
      { name: "Chargers" },
      { name: "Speakers" },
      { name: "Smart Watches" },
    ],
  },
  {
    name: "Home & Kitchen",
    slug: "home-and-kitchen",
    live: false,
    items: [
      { name: "Cookware" },
      { name: "Storage" },
      { name: "D\u00e9cor" },
      { name: "Bedding" },
    ],
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty-and-personal-care",
    live: false,
    items: [
      { name: "Skincare" },
      { name: "Makeup" },
      { name: "Hair Care" },
      { name: "Fragrance" },
    ],
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-and-outdoors",
    live: false,
    items: [
      { name: "Gym Gear" },
      { name: "Football" },
      { name: "Camping" },
      { name: "Cycling" },
    ],
  },
  { name: "Appliances", slug: "appliances", live: false },
  { name: "Automotive", slug: "automotive", live: false },
  { name: "Baby & Maternity", slug: "baby-and-maternity", live: false },
  { name: "Bags & Luggage", slug: "bags-and-luggage", live: false },
  { name: "Books & Media", slug: "books-and-media", live: false },
  {
    name: "Cell Phones & Accessories",
    slug: "cell-phones-and-accessories",
    live: false,
  },
  { name: "Furniture", slug: "furniture", live: false },
  { name: "Gaming", slug: "gaming", live: false },
  { name: "Groceries", slug: "groceries", live: false },
  { name: "Health & Household", slug: "health-and-household", live: false },
  {
    name: "Jewelry & Accessories",
    slug: "jewelry-and-accessories",
    live: false,
  },
  { name: "Liquor", slug: "liquor", live: false },
  { name: "Men's Clothing", slug: "mens-clothing", live: false },
  { name: "Men's Shoes", slug: "mens-shoes", live: false },
  { name: "Musical Instruments", slug: "musical-instruments", live: false },
  {
    name: "Office & School Supplies",
    slug: "office-and-school-supplies",
    live: false,
  },
  {
    name: "Patio, Lawn & Garden",
    slug: "patio-lawn-and-garden",
    live: false,
  },
  { name: "Pet Supplies", slug: "pet-supplies", live: false },
  {
    name: "Tools & Home Improvement",
    slug: "tools-and-home-improvement",
    live: false,
  },
  { name: "Toys & Games", slug: "toys-and-games", live: false },
  { name: "Women's Clothing", slug: "womens-clothing", live: false },
  { name: "Women's Shoes", slug: "womens-shoes", live: false },
];

// Panels shown on the home page (these need `items` above)
export const showcaseSlugs = [
  "clothes",
  "digital-products",
  "electronics",
  "home-and-kitchen",
  "beauty-and-personal-care",
  "sports-and-outdoors",
];

// Links shown in the navbar's second row
export const navSlugs = [
  "clothes",
  "digital-products",
  "electronics",
  "home-and-kitchen",
  "beauty-and-personal-care",
  "sports-and-outdoors",
  "toys-and-games",
  "gaming",
];
