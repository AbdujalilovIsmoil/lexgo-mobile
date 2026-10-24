import { scrub } from "./sanitize";

describe("scrub", () => {
  it("drops secrets and blanks phone numbers, keeping the shape", () => {
    const out = scrub({ id: "1", token: "t", members: [{ name: "Ali", phone: "+998901234567", userId: "u" }], client: { phone_number: "+99890", tel: "1" } });
    expect(out).toEqual({ id: "1", members: [{ name: "Ali", phone: "", userId: "u" }], client: { phone_number: "", tel: "" } });
  });
  it("leaves other fields that only contain the word alone", () => {
    expect(scrub({ phoneVerified: true, telegram: "x" })).toEqual({ phoneVerified: true, telegram: "x" });
  });
});
