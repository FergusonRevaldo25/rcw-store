// Paste any raw list of category names here, one per line or comma-separated.
const rawList = `
Home & Kitchen
Women's Clothing
Women's Shoes
Men's Clothing
Men's Shoes
Sports & Outdoors
Jewelry & Accessories
Beauty & Personal Care
Toys & Games
Automotive
Baby & Maternity
Bags & Luggage
Patio, Lawn & Garden
Electronics
Tools & Home Improvement
Appliances
Office & School Supplies
Health & Household
Pet Supplies
Cell Phones & Accessories
Musical Instruments
Books & Media
Furniture
Gaming
Groceries
Liquor
`;

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const names = rawList
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

const entries = names
  .map((name) => {
    const slug = slugify(name);
    return `  { slug: "${slug}", label: "${name.replace(/"/g, '\\"')}", active: false },`;
  })
  .join("\n");

console.log(entries);
