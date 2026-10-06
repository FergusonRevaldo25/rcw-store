import { describe, expect, it } from "vitest";
import { parseRand, rand } from "@/lib/pos/money";

describe("rand (cents to display)", () => {
  it.each([
    [0, "R0.00"],
    [1, "R0.01"],
    [5, "R0.05"],
    [100, "R1.00"],
    [24999, "R249.99"],
    [100000, "R1000.00"],
  ])("formats %i cents as %s", (cents, expected) => {
    expect(rand(cents)).toBe(expected);
  });
});

describe("parseRand (text to cents)", () => {
  it.each([
    ["249.99", 24999],
    ["249,99", 24999],
    ["  249.99  ", 24999],
    ["0", 0],
    ["0.1", 10],
    ["5", 500],
    // Values that are easy to get wrong with floating point maths
    ["19.99", 1999],
    ["0.29", 29],
    ["1.15", 115],
    ["8.2", 820],
  ])("reads %j as %i cents", (input, expected) => {
    expect(parseRand(input)).toBe(expected);
  });

  it.each([
    [""],
    ["   "],
    ["abc"],
    ["R249.99"],
    ["-5"],
    ["."],
    ["Infinity"],
    ["NaN"],
    ["1,000.50"], // thousands separators are not supported
    ["249,99,5"],
  ])("rejects %j", (input) => {
    expect(parseRand(input)).toBeNull();
  });

  it("allows up to R10,000,000 and rejects anything above", () => {
    expect(parseRand("10000000")).toBe(1_000_000_000);
    expect(parseRand("10000000.01")).toBeNull();
  });

  it("round-trips whole-cent amounts", () => {
    for (const cents of [1, 99, 100, 12345, 99999]) {
      const text = (cents / 100).toFixed(2);
      expect(parseRand(text)).toBe(cents);
    }
  });

  // Known gaps in parseRand (it accepts text that is not a plain amount).
  // Remove the todo and make these real tests once parseRand is tightened.
  it.todo("rejects scientific notation such as 1e3");
  it.todo("rejects hex such as 0x10");
  it.todo("rejects more than two decimal places instead of rounding");
});
