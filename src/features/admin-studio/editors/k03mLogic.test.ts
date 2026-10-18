import { tiersOf, validateK03M } from "./k03mLogic";

const tier = (t: string, price: unknown) => ({ tier: t, title: t, price, duration: "7 days", included: ["x"] });

describe("K03-M tiers", () => {
  it("always yields BASIC, STANDARD, PREMIUM in order", () => {
    expect(tiersOf([tier("PREMIUM", 3), tier("BASIC", 1)]).map((t) => t.tier)).toEqual(["BASIC", "STANDARD", "PREMIUM"]);
    expect(tiersOf(undefined)).toHaveLength(3);
  });
  it("accepts any price >= 0 (no bound from the components)", () => {
    expect(validateK03M({ tiers: [tier("BASIC", 0), tier("STANDARD", 900000), tier("PREMIUM", 1)] })).toEqual({});
  });
  it("rejects a missing tier, duplicates and negative prices", () => {
    expect(validateK03M({ tiers: [tier("BASIC", 1), tier("STANDARD", 1)] }).tiers).toBe("@tiers");
    expect(validateK03M({ tiers: [tier("BASIC", 1), tier("BASIC", 1), tier("PREMIUM", 1)] }).tiers).toBe("@tiers");
    expect(validateK03M({ tiers: [tier("BASIC", -5), tier("STANDARD", ""), tier("PREMIUM", 1)] })).toMatchObject({ "tiers.0.price": "@negative", "tiers.1.price": "@required" });
  });
});
