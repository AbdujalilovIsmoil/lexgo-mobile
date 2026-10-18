import { z } from "zod";
import * as rules from "./rules";

// A small schema built from the same rules the forms use.
const complaintLike = z.object({ category: rules.pick, subject: rules.text(3, 150), desc: rules.text(15, 4000) });

describe("form rules", () => {
  it("name needs two letters and no digits", () => {
    expect(rules.personName.safeParse("Ali").success).toBe(true);
    expect(rules.personName.safeParse("A").success).toBe(false);
    expect(rules.personName.safeParse("Ali 123").success).toBe(false);
    expect(rules.personName.safeParse("   ").success).toBe(false);
  });
  it("phone must be a complete Uzbek number", () => {
    expect(rules.phone.safeParse("+998 90 123 45 67").success).toBe(true);
    expect(rules.phone.safeParse("+998 90 123").success).toBe(false);
    expect(rules.optPhone.safeParse("+998 ").success).toBe(true);
    expect(rules.optPhone.safeParse("+998 90").success).toBe(false);
  });
  it("e-mail is optional but must be valid when given", () => {
    expect(rules.optEmail.safeParse("").success).toBe(true);
    expect(rules.optEmail.safeParse("a@b.uz").success).toBe(true);
    expect(rules.optEmail.safeParse("a@b").success).toBe(false);
  });
  it("card expiry must be a real month and not past", () => {
    expect(rules.cardExpiry.safeParse("13/30").success).toBe(false);
    expect(rules.cardExpiry.safeParse("01/20").success).toBe(false);
    expect(rules.cardExpiry.safeParse("12/99").success).toBe(true);
  });
  it("text reports the key of the first broken rule", () => {
    const r = rules.text(10, 20).safeParse("short");
    expect(r.success).toBe(false);
    expect(!r.success && r.error.issues[0].message).toBe("ntd.val.min|10");
    expect(rules.text(10, 20).safeParse("").success).toBe(false);
  });
  it("complaint needs a category, subject and description", () => {
    expect(complaintLike.safeParse({ category: "", subject: "ab", desc: "x" }).success).toBe(false);
  });
});
