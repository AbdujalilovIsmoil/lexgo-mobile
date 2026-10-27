import { normService } from "./normalize";

describe("a service of the /manage list", () => {
  it("reads a service held back by its rules as paused, and marks it", () => {
    expect(normService({ id: "s1", status: "rules_pending" })).toMatchObject({ status: "paused", rulesPending: true });
    expect(normService({ id: "s2", status: "active", rules_accepted: false })).toMatchObject({ status: "active", rulesPending: true });
    expect(normService({ id: "s3", status: "active", rules_status: "pending" }).rulesPending).toBe(true);
    expect(normService({ id: "s4", status: "active", rules_status: "accepted" }).rulesPending).toBe(false);
    expect(normService({ id: "s5", status: "archived" }).status).toBe("inactive");
  });
  it("keeps the negotiation choice only when the list says it", () => {
    expect(normService({ id: "s1", negotiation_allowed: true }).negotiationAllowed).toBe(true);
    expect(normService({ id: "s1" }).negotiationAllowed).toBeNull();
  });
});
