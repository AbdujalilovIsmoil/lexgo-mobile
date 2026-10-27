import { acceptedRuleOf } from "./ruleEvent";

describe("marketplace.rule_accepted on the user socket", () => {
  it("finds the rule id on the event, under data / payload or in a rule object", () => {
    expect(acceptedRuleOf({ event: "marketplace.rule_accepted", rule_id: "r1" })).toBe("r1");
    expect(acceptedRuleOf({ event: "marketplace.rule_accepted", data: { rule_id: "r2" } })).toBe("r2");
    expect(acceptedRuleOf({ event: "marketplace_rule_accepted", payload: { rule: { id: "r3" } } })).toBe("r3");
  });
  it("ignores an event without a rule id and other events (TZ.md §10: check the id first)", () => {
    expect(acceptedRuleOf({ event: "marketplace.rule_accepted" })).toBe("");
    expect(acceptedRuleOf({ event: "marketplace.order_started", rule_id: "r1" })).toBe("");
  });
  it("reads a notification.created that wraps one", () => {
    expect(acceptedRuleOf({ event: "notification.created", notification: { data: { event: "marketplace.rule_accepted", rule_id: "r4" } } })).toBe("r4");
    expect(acceptedRuleOf({ event: "notification.created", notification: { type: "marketplace.rule_accepted", entity_type: "service_rule", entity_id: "r5" } })).toBe("r5");
    expect(acceptedRuleOf({ event: "notification.created", notification: { data: { event: "order_created", rule_id: "r6" } } })).toBe("");
  });
});
