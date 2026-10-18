import { priceIssue } from "./rules";

const band = { recommended: 100, min: 70, max: 100, base: null, currency: "UZS", modifiers: null };

describe("seller service price (TZ 5.1)", () => {
  it("a lower price is allowed, a price above the backend maximum is not", () => {
    expect(priceIssue(50, band)).toBeNull();
    expect(priceIssue(100, band)).toBeNull();
    expect(priceIssue(101, band)).toBe("high");
  });
  it("nothing to check without a band or a price", () => {
    expect(priceIssue(500, null)).toBeNull();
    expect(priceIssue(0, band)).toBeNull();
  });
});
