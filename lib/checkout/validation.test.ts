import { describe, expect, it } from "vitest";
import {
  PROVINCES,
  validateCheckoutForm,
  type CheckoutForm,
} from "@/lib/checkout/validation";

const good: CheckoutForm = {
  name: "Thandi Mokoena",
  email: "thandi@example.com",
  phone: "082 123 4567",
  address1: "12 Long Street",
  address2: "",
  suburb: "Gardens",
  city: "Cape Town",
  province: "Western Cape",
  postalCode: "8001",
  note: "",
};

function fail(input: unknown) {
  const r = validateCheckoutForm(input);
  if (r.ok) throw new Error("expected validation to fail");
  return r.errors;
}

describe("validateCheckoutForm: valid input", () => {
  it("accepts a complete form", () => {
    const r = validateCheckoutForm(good);
    expect(r.ok).toBe(true);
  });

  it("allows the optional fields to be empty", () => {
    const r = validateCheckoutForm({ ...good, address2: "", note: "" });
    expect(r.ok).toBe(true);
  });

  it("trims and collapses extra spaces", () => {
    const r = validateCheckoutForm({
      ...good,
      name: "  Thandi   Mokoena  ",
      address1: " 12   Long  Street ",
      email: " thandi@example.com ",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.name).toBe("Thandi Mokoena");
      expect(r.value.address1).toBe("12 Long Street");
      expect(r.value.email).toBe("thandi@example.com");
    }
  });

  it.each(PROVINCES.map((p) => [p]))("accepts the province %s", (province) => {
    expect(validateCheckoutForm({ ...good, province }).ok).toBe(true);
  });

  it.each([["+27 82 123 4567"], ["(021) 555-1234"], ["0821234567"]])(
    "accepts the phone number %s",
    (phone) => {
      expect(validateCheckoutForm({ ...good, phone }).ok).toBe(true);
    }
  );
});

describe("validateCheckoutForm: required fields", () => {
  it.each([
    ["name"],
    ["email"],
    ["phone"],
    ["address1"],
    ["suburb"],
    ["city"],
    ["province"],
    ["postalCode"],
  ] as const)("requires %s", (key) => {
    expect(fail({ ...good, [key]: "" })[key]).toBeTruthy();
    expect(fail({ ...good, [key]: "   " })[key]).toBeTruthy();
  });

  it("reports every missing field for empty or non-object input", () => {
    for (const input of [{}, null, undefined, "text", 42, []]) {
      const errors = fail(input);
      expect(Object.keys(errors).length).toBeGreaterThanOrEqual(8);
    }
  });

  it("ignores values that are not strings", () => {
    const errors = fail({ ...good, name: 123, email: { a: 1 } });
    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
  });
});

describe("validateCheckoutForm: formats", () => {
  it.each([["not-an-email"], ["a@b"], ["a b@c.com"], ["@c.com"]])(
    "rejects the email %j",
    (email) => {
      expect(fail({ ...good, email }).email).toBeTruthy();
    }
  );

  it.each([["abc"], ["12345"], ["0821234567x"], ["1234567890123456"]])(
    "rejects the phone %j",
    (phone) => {
      expect(fail({ ...good, phone }).phone).toBeTruthy();
    }
  );

  it.each([["123"], ["12345"], ["abcd"], ["12 34"]])(
    "rejects the postal code %j",
    (postalCode) => {
      expect(fail({ ...good, postalCode }).postalCode).toBeTruthy();
    }
  );

  it("rejects a province that is not in the list", () => {
    expect(fail({ ...good, province: "Narnia" }).province).toBeTruthy();
  });

  it("rejects values that are too long", () => {
    expect(fail({ ...good, name: "a".repeat(101) }).name).toBeTruthy();
    expect(fail({ ...good, note: "a".repeat(501) }).note).toBeTruthy();
    expect(fail({ ...good, address1: "a".repeat(121) }).address1).toBeTruthy();
  });
});
