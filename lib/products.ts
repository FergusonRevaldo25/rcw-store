import { Product } from "@/types/product";

export const products: Product[] = [
  {
    slug: "rcw-hoodie-black",
    name: "RCW Black Hoodie",
    category: "clothes",
    price: 549,
    description: "Premium black hoodie with the RCW logo. Unisex fit.",
    image: "/products/hoodie-black.jpg",
  },
  {
    slug: "rcw-tshirt-white",
    name: "RCW White T-Shirt",
    category: "clothes",
    price: 249,
    description: "Soft cotton tee with a minimal RCW print.",
    image: "/products/tshirt-white.jpg",
  },
  {
    slug: "invoice-template-pack",
    name: "Invoice Template Pack",
    category: "digital-products",
    price: 149,
    description: "10 editable invoice templates for small businesses.",
    image: "/products/invoice-templates.jpg",
  },
  {
    slug: "social-media-kit",
    name: "Social Media Starter Kit",
    category: "digital-products",
    price: 199,
    description: "50 editable social media post templates.",
    image: "/products/social-kit.jpg",
  },
];

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
