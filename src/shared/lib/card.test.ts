import { cardOk, expiryOk, formatCard, formatExpiry } from "./card";

describe("card helpers", () => {
  it("groups digits by four and drops everything else", () => {
    expect(formatCard("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatCard("4242-4242 4242 4242 99999")).toBe("4242 4242 4242 4242 999");
    expect(formatCard("abc")).toBe("");
  });
  it("accepts a valid Luhn number and rejects a wrong or short one", () => {
    expect(cardOk("4242 4242 4242 4242")).toBe(true);
    expect(cardOk("4242 4242 4242 4243")).toBe(false);
    expect(cardOk("4242 4242 4242")).toBe(false);
    expect(cardOk("")).toBe(false);
  });
  it("formats the expiry as MM/YY", () => {
    expect(formatExpiry("1228")).toBe("12/28");
    expect(formatExpiry("3")).toBe("03");
    expect(formatExpiry("12")).toBe("12");
  });
  it("checks the expiry against the current month", () => {
    const now = new Date(2026, 10, 4); // November 2026
    expect(expiryOk("11/26", now)).toBe(true);
    expect(expiryOk("10/26", now)).toBe(false);
    expect(expiryOk("01/27", now)).toBe(true);
    expect(expiryOk("13/27", now)).toBe(false);
    expect(expiryOk("1/27", now)).toBe(false);
  });
});
