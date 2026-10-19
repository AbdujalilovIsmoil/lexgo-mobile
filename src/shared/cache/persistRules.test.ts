import { isDenied, ruleFor } from "./persistRules";

describe("persist allow/deny list", () => {
  it("persists work lists", () => {
    expect(ruleFor(["pro-tasks"])).not.toBeNull();
    expect(ruleFor(["pro-cases", "list"])).not.toBeNull();
    expect(ruleFor(["my-docs", "lite"])).not.toBeNull();
    expect(ruleFor(["notifications", "list"])).not.toBeNull();
    expect(ruleFor(["secure-chat", "rooms"])).not.toBeNull();
    expect(ruleFor(["pro-workspace", "cabinet"])).not.toBeNull();
    expect(ruleFor(["pro-requests"])).not.toBeNull();
    expect(ruleFor(["pro-files", "tree", ""])).not.toBeNull();
    expect(ruleFor(["pro-docs", "list", "new"])).not.toBeNull();
    expect(ruleFor(["works", "list"])).not.toBeNull();
  });
  it("never persists credentials, payments, security, chat contents", () => {
    for (const k of [["auth-lock"], ["auth-consents"], ["admin-otp", "x"], ["pay-methods"], ["pay-profile"], ["payments", "list"], ["identity-me"], ["call", "1"], ["secure-chat", "messages", "r1"], ["secure-chat", "keys"], ["my-docs", "chat", "d1"], ["pro-cases", "room", "c1"], ["pro-docs", "editor", "d1"], ["pro-docs", "sources", "d1"], ["pro-files", "versions", "f1"], ["pro-workspace", "payouts"]]) {
      expect(isDenied(k)).toBe(true);
      expect(ruleFor(k)).toBeNull();
    }
  });
  it("does not persist unlisted queries", () => {
    expect(ruleFor(["something-new"])).toBeNull();
  });
});
