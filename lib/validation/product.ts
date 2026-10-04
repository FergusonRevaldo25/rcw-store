export type ProductValues = {
  name: string;
  description: string;
  priceRand: string;
  categoryId: string;
  image: string;
  stock: string;
  isDigital: boolean;
  trackStock: boolean;
};

export type ProductData = {
  name: string;
  description: string;
  priceCents: number;
  categoryId: string;
  image: string;
  stock: number;
  isDigital: boolean;
  trackStock: boolean;
};

export type ProductErrors = Partial<Record<keyof ProductValues, string>>;

export function validateProduct(
  f: FormData,
  validCategoryIds: Set<string>
):
  | { ok: true; data: ProductData }
  | { ok: false; errors: ProductErrors; values: ProductValues } {
  const values: ProductValues = {
    name: String(f.get("name") ?? "").trim(),
    description: String(f.get("description") ?? "").trim(),
    priceRand: String(f.get("priceRand") ?? "").trim(),
    categoryId: String(f.get("categoryId") ?? ""),
    image: String(f.get("image") ?? "").trim(),
    stock: String(f.get("stock") ?? "0").trim(),
    isDigital: f.get("isDigital") === "on",
    trackStock: f.get("trackStock") === "on",
  };
  const errors: ProductErrors = {};

  if (values.name.length < 3 || values.name.length > 100)
    errors.name = "Enter a product name (3 to 100 characters).";
  if (values.description.length < 20 || values.description.length > 2000)
    errors.description = "Describe the product in 20 to 2000 characters.";

  const rand = Number(values.priceRand.replace(",", "."));
  if (!Number.isFinite(rand) || rand <= 0 || rand > 1_000_000)
    errors.priceRand = "Enter a price in Rand, e.g. 249.99.";

  if (!validCategoryIds.has(values.categoryId))
    errors.categoryId = "Choose a category.";

  if (!/^(\/[^\s]+|https:\/\/[^\s]+)$/.test(values.image))
    errors.image = "Enter an image path (/products/...) or an https link.";

  const stock = Number(values.stock);
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000)
    errors.stock = "Stock must be a whole number from 0 to 100000.";

  if (Object.keys(errors).length) return { ok: false, errors, values };

  return {
    ok: true,
    data: {
      name: values.name,
      description: values.description,
      priceCents: Math.round(rand * 100),
      categoryId: values.categoryId,
      image: values.image,
      stock,
      isDigital: values.isDigital,
      trackStock: values.isDigital ? false : values.trackStock,
    },
  };
}