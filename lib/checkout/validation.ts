// Pure checkout form validation. Used in the browser (for fast feedback)
// and again on the server (the only check that counts).

export const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
] as const;

export type CheckoutForm = {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  note: string;
};

export type FormErrors = Partial<Record<keyof CheckoutForm, string>>;

export const EMPTY_FORM: CheckoutForm = {
  name: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  suburb: "",
  city: "",
  province: "",
  postalCode: "",
  note: "",
};

const MAX: Record<keyof CheckoutForm, number> = {
  name: 100,
  email: 254,
  phone: 20,
  address1: 120,
  address2: 120,
  suburb: 80,
  city: 80,
  province: 40,
  postalCode: 4,
  note: 500,
};

const REQUIRED: (keyof CheckoutForm)[] = [
  "name",
  "email",
  "phone",
  "address1",
  "suburb",
  "city",
  "province",
  "postalCode",
];

const LABEL: Record<keyof CheckoutForm, string> = {
  name: "Full name",
  email: "Email address",
  phone: "Phone number",
  address1: "Street address",
  address2: "Apartment or complex",
  suburb: "Suburb",
  city: "City or town",
  province: "Province",
  postalCode: "Postal code",
  note: "Delivery note",
};

export function validateCheckoutForm(
  input: unknown
):
  | { ok: true; value: CheckoutForm }
  | { ok: false; errors: FormErrors } {
  const raw = (input && typeof input === "object" ? input : {}) as Record<
    string,
    unknown
  >;
  const text = (key: keyof CheckoutForm) =>
    typeof raw[key] === "string" ? (raw[key] as string).trim() : "";

  const value: CheckoutForm = {
    name: text("name").replace(/\s+/g, " "),
    email: text("email"),
    phone: text("phone"),
    address1: text("address1").replace(/\s+/g, " "),
    address2: text("address2").replace(/\s+/g, " "),
    suburb: text("suburb").replace(/\s+/g, " "),
    city: text("city").replace(/\s+/g, " "),
    province: text("province"),
    postalCode: text("postalCode"),
    note: text("note"),
  };

  const errors: FormErrors = {};

  for (const key of REQUIRED) {
    if (!value[key]) errors[key] = `${LABEL[key]} is required.`;
  }
  for (const key of Object.keys(MAX) as (keyof CheckoutForm)[]) {
    if (!errors[key] && value[key].length > MAX[key]) {
      errors[key] = `${LABEL[key]} is too long.`;
    }
  }

  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!errors.phone) {
    const digits = value.phone.replace(/\D/g, "");
    if (!/^[+\d\s()-]+$/.test(value.phone) || digits.length < 9 || digits.length > 15) {
      errors.phone = "Enter a valid phone number.";
    }
  }
  if (!errors.postalCode && !/^\d{4}$/.test(value.postalCode)) {
    errors.postalCode = "Enter a 4-digit postal code.";
  }
  if (
    !errors.province &&
    !(PROVINCES as readonly string[]).includes(value.province)
  ) {
    errors.province = "Choose a province.";
  }

  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, value };
}
