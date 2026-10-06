import { describe, expect, it } from "vitest";
import { FREE_DELIVERY_OVER } from "@/lib/config";
import { freeOver, getQuote } from "@/lib/delivery";

const REST = "the rest of South Africa";

describe("getQuote: input checking", () => {
  it.each([[""], ["123"], ["12345"], ["abcd"], ["12 34"], [" 1400"], ["14.0"], ["-100"]])(
    "returns null for %j",
    (code) => {
      expect(getQuote(code)).toBeNull();
    }
  );
});

// These pin the PLACEHOLDER zones in lib/delivery.ts.
// When the real courier zones go in, update this table. That is the point:
// a zone change should be a deliberate, reviewed change.
describe("getQuote: zone boundaries", () => {
  it.each([
    ["0001", "Pretoria"],
    ["0150", "Pretoria"],
    ["0299", "Pretoria"],
    ["0300", REST],
    ["1399", REST],
    ["1400", "Johannesburg"],
    ["2199", "Johannesburg"],
    ["2200", REST],
    ["3999", REST],
    ["4000", "Durban"],
    ["4099", "Durban"],
    ["4100", REST],
    ["7099", REST],
    ["7100", "Cape Town"],
    ["8099", "Cape Town"],
    ["8100", REST],
    ["9999", REST],
  ])("code %s is in %s", (code, area) => {
    expect(getQuote(code)?.area).toBe(area);
  });
});

describe("getQuote: every valid code", () => {
  it("returns a usable quote for all 10,000 four-digit codes", () => {
    for (let i = 0; i < 10_000; i++) {
      const code = String(i).padStart(4, "0");
      const q = getQuote(code);
      expect(q, `no quote for ${code}`).not.toBeNull();
      expect(Number.isInteger(q!.fee), `fee for ${code}`).toBe(true);
      expect(q!.fee, `fee for ${code}`).toBeGreaterThan(0);
      expect(q!.area.length).toBeGreaterThan(0);
      expect(q!.days.length).toBeGreaterThan(0);
    }
  });

  it("exposes the free delivery threshold from config", () => {
    expect(freeOver).toBe(FREE_DELIVERY_OVER);
    expect(freeOver).toBeGreaterThan(0);
  });

  it.todo("treats 0000 as invalid (it currently gets the rest-of-SA fee)");
});
