import { anyOfOptions, barPercent, isPercentKey, partsOf } from "./requirements";

describe("requirement progress bar", () => {
  it("clamps only the bar to 0..100", () => {
    expect(barPercent(30)).toBe(30);
    expect(barPercent(94.5)).toBe(94.5);
    expect(barPercent(140)).toBe(100);
    expect(barPercent(-5)).toBe(0);
  });
  it("draws an empty bar when there is no usable number", () => {
    expect(barPercent(null)).toBe(0);
    expect(barPercent(NaN)).toBe(0);
    expect(barPercent(Infinity)).toBe(0);
  });
});

describe("requirement values", () => {
  it("prints a scalar as one keyless part", () => {
    expect(partsOf(3)).toEqual([{ key: "", value: 3 }]);
    expect(partsOf("verified")).toEqual([{ key: "", value: "verified" }]);
    expect(partsOf(null)).toEqual([{ key: "", value: null }]);
  });
  it("prints an object field by field, leaving any_of and nested objects out", () => {
    const current = { wins: 20, success_rate: 80, total_cases: 25, rating: 4.8, reviews: 12 };
    expect(partsOf(current)).toEqual([{ key: "wins", value: 20 }, { key: "success_rate", value: 80 }, { key: "total_cases", value: 25 }, { key: "rating", value: 4.8 }, { key: "reviews", value: 12 }]);
    expect(partsOf({ any_of: [{ wins: 50 }], extra: { a: 1 }, years: 5 })).toEqual([{ key: "years", value: 5 }]);
  });
  it("reads the any_of alternatives of the seller_performance example", () => {
    const required = { any_of: [{ wins: 50 }, { success_rate: 85, total_cases: 20 }, { rating: 5, reviews: 20 }, {}] };
    expect(anyOfOptions(required)).toEqual([{ wins: 50 }, { success_rate: 85, total_cases: 20 }, { rating: 5, reviews: 20 }]);
    expect(anyOfOptions(10)).toBeNull();
    expect(anyOfOptions({ wins: 50 })).toBeNull();
    expect(anyOfOptions({ any_of: [] })).toBeNull();
  });
  it("marks percentage fields only", () => {
    expect(isPercentKey("success_rate")).toBe(true);
    expect(isPercentKey("discount_percent")).toBe(true);
    expect(isPercentKey("rating")).toBe(false);
    expect(isPercentKey("wins")).toBe(false);
  });
});
