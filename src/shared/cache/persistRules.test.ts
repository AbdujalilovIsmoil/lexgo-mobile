import { isDenied, ruleFor } from "./persistRules";

describe("persist allow/deny list", () => {
  it("persists work lists", () => {
    expect(ruleFor(["pro-tasks"])).not.toBeNull();
    expect(ruleFor(["pro-cases", "list"])).not.toBeNull();
    expect(ruleFor(["my-docs", "lite"])).not.toBeNull();
    expect(ruleFor(["notifications", "list"])).not.toBeNull();
    expect(ruleFor(["secure-chat", "rooms"])).not.toBeNull();
  });
  it("never persists credentials, payments, security, chat contents", () => {
    for (const k of [["auth-lock"], ["auth-consents"], ["admin-otp", "x"], ["pay-methods"], ["pay-profile"], ["payments", "list"], ["identity-me"], ["call", "1"], ["secure-chat", "messages", "r1"], ["secure-chat", "keys"], ["my-docs", "chat", "d1"], ["pro-cases", "room", "c1"]]) {
      expect(isDenied(k)).toBe(true);
      expect(ruleFor(k)).toBeNull();
    }
  });
  it("does not persist unlisted queries", () => {
    expect(ruleFor(["something-new"])).toBeNull();
  });
});
