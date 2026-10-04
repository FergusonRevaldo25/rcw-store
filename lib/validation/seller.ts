export type SellerInput = {
  businessName: string;
  contactPhone: string;
  category: string;
  description: string;
};

export type SellerErrors = Partial<
  Record<keyof SellerInput | "terms", string>
>;

export function validateSellerApplication(f: FormData):
  | { ok: true; data: SellerInput }
  | { ok: false; errors: SellerErrors; values: SellerInput } {
  const values: SellerInput = {
    businessName: String(f.get("businessName") ?? "").trim(),
    contactPhone: String(f.get("contactPhone") ?? "").trim(),
    category: String(f.get("category") ?? "").trim(),
    description: String(f.get("description") ?? "").trim(),
  };
  const errors: SellerErrors = {};

  if (values.businessName.length < 2 || values.businessName.length > 80)
    errors.businessName = "Enter your business name (2 to 80 characters).";

  const digits = values.contactPhone.replace(/[\s()-]/g, "");
  if (!/^(\+27|0)\d{9}$/.test(digits))
    errors.contactPhone = "Enter a valid South African number, e.g. 082 000 0000.";

  if (values.category.length < 2 || values.category.length > 60)
    errors.category = "Tell us what you sell (2 to 60 characters).";

  if (values.description.length < 20 || values.description.length > 500)
    errors.description = "Describe your business in 20 to 500 characters.";

  if (f.get("terms") !== "on")
    errors.terms = "You must accept the seller terms to apply.";

  if (Object.keys(errors).length) return { ok: false, errors, values };
  return { ok: true, data: { ...values, contactPhone: digits } };
}