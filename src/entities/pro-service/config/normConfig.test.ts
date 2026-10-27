import { configBody, enableBody, selectedToSend } from "./configApi";
import { normConfig, normRequirement } from "./normConfig";

// The TZ.md §5.3 + "Pricing Growth" §2 answer of GET /marketplace/me/services/{id}/configuration.
const answer = {
  service_id: "s1",
  enabled: false,
  selected_price: 700000,
  minimum_listing_price: 250000,
  maximum_price: 1500000,
  recommended_price: 500000,
  below_recommended_allowed: true,
  maximum_listing_discount_percent: 50,
  negotiation_minimum_price: 300000,
  negotiation_allowed: true,
  status: "paused",
  rules_status: "pending",
  price_explanation: ["Asosiy narx", { text: "Hudud +10%" }, ""],
  maximum_increase_percent: 30,
  requirements: [
    { key: "lawyer_experience", current: 3, required: 10, unit: "year", met: false, progress_percent: 30 },
    { key: "seller_performance", current: { wins: 20, success_rate: 80 }, required: { any_of: [{ wins: 50 }, { success_rate: 85, total_cases: 20 }] }, unit: "mixed", met: false, progress_percent: 94 },
  ],
  rules_accepted: false,
  missing_rule_ids: ["r2"],
  required_rules: [{ id: "r1", title: "Umumiy", accepted: true }, { id: "r2", title: "Xizmat qoidasi", accepted: false }, { id: "c1", title: "Mijoz qoidasi", audience: "client" }],
  selectable_rules: [{ id: "o1", title: "Bepul birinchi qo'ng'iroq" }, { id: "o2", title: "Sotuvchi tanlay olmaydi", seller_selectable: false }, { id: "o3", title: "Mijozniki", audience: "customer" }],
  selected_rule_ids: ["o1"],
  pricing_limits: { maximum_increase_percent: 99, requirements: [] },
};

describe("seller service configuration normaliser", () => {
  it("reads every field of the answer, the top-level fields winning over pricing_limits", () => {
    const c = normConfig(answer, "x");
    expect(c).toMatchObject({
      serviceId: "s1", enabled: false, status: "paused", selectedPrice: 700000, minimumListingPrice: 250000, maximumPrice: 1500000, recommendedPrice: 500000,
      maxDiscountPercent: 50, negotiationAllowed: true, negotiationMinimumPrice: 300000, maxIncreasePercent: 30, rulesAccepted: false, rulesStatus: "pending",
      rulesPending: true, missingRuleIds: ["r2"], selectedRuleIds: ["o1"], priceExplanation: "Asosiy narx Hudud +10%", priceExplanationLines: ["Asosiy narx", "Hudud +10%"],
    });
    expect(c.requirements.map((r) => [r.key, r.progress, r.met])).toEqual([["lawyer_experience", 30, false], ["seller_performance", 94, false]]);
  });
  it("never mixes client rules in, and keeps only rules the seller may pick", () => {
    const c = normConfig(answer);
    expect(c.requiredRules.map((r) => r.id)).toEqual(["r1", "r2"]);
    expect(c.selectableRules.map((r) => r.id)).toEqual(["o1"]);
  });
  it("falls back to pricing_limits, a nested configuration and the rules' own flags", () => {
    const c = normConfig({ configuration: { service_id: "s2", enabled: true, status: "active", selected_price: "450000", rules_accepted: false, required_rules: [{ id: "a", accepted: true }, { id: "b" }], pricing_limits: { recommended_price: 400000, maximum_price: 900000, minimum_listing_price: 200000, maximum_increase_percent: 15, requirements: [{ key: "client_rating", current: 4.2, required: 4.5, met: false, progress_percent: 60 }] } } }, "x");
    expect(c).toMatchObject({ serviceId: "s2", enabled: true, selectedPrice: 450000, recommendedPrice: 400000, maximumPrice: 900000, minimumListingPrice: 200000, maxIncreasePercent: 15, missingRuleIds: ["b"], rulesPending: true });
    expect(c.requirements[0]).toMatchObject({ key: "client_rating", current: 4.2, required: 4.5 });
  });
  it("an empty answer is a quiet configuration: no growth note, nothing pending, unknown choices stay unknown", () => {
    const c = normConfig({}, "s3");
    expect(c).toMatchObject({ serviceId: "s3", enabled: null, maxIncreasePercent: 0, requirements: [], rulesPending: false, missingRuleIds: [], negotiationAllowed: null, selectedRuleIds: null, maxDiscountPercent: null });
  });
  it("a rules-pending status or rules_status holds the service back", () => {
    expect(normConfig({ status: "rules_pending" }).rulesPending).toBe(true);
    expect(normConfig({ rules_status: "rules_acceptance_required" }).rulesPending).toBe(true);
    expect(normConfig({ rules_status: "accepted", rules_accepted: true }).rulesPending).toBe(false);
  });
  it("reads the picks from the rules' selected flags when the id list is missing", () => {
    expect(normConfig({ selectable_rules: [{ id: "o1", selected: true }, { id: "o2" }] }).selectedRuleIds).toEqual(["o1"]);
  });
});

describe("requirement items", () => {
  it("keeps the backend's verdict and numbers as given, never deriving them", () => {
    const r = normRequirement({ key: "lawyer_experience", current: "12", required: 10, unit: "YEAR", met: false, progress_percent: 140 });
    expect(r).toMatchObject({ current: 12, required: 10, unit: "year", met: false, progress: 140 });
  });
  it("tolerates unknown keys, labels only, and odd values", () => {
    expect(normRequirement({ label: "Yangi mezon", current: "a lot", required: true })).toMatchObject({ key: "", label: "Yangi mezon", current: "a lot", required: true, met: false, progress: null });
    expect(normRequirement({ key: "future_metric", current: [1, 2], met: true })).toMatchObject({ current: null, met: true });
    expect(normRequirement({ unit: "year" })).toBeNull();
  });
});

describe("configuration bodies", () => {
  it("sends only the given fields, the price rounded and the rule ids trimmed and unique", () => {
    expect(configBody({})).toEqual({});
    expect(configBody({ negotiationAllowed: false })).toEqual({ negotiation_allowed: false });
    expect(configBody({ enabled: true, selectedPrice: 1234.6, negotiationAllowed: true, selectedRuleIds: [" a ", "a", "", "b"] })).toEqual({ enabled: true, selected_price: 1235, negotiation_allowed: true, selected_rule_ids: ["a", "b"] });
    expect(configBody({ selectedPrice: NaN })).toEqual({});
  });
  it("switching on sends the whole configuration (TZ.md §5.3)", () => {
    expect(configBody(enableBody(normConfig(answer)))).toEqual({ enabled: true, selected_price: 700000, negotiation_allowed: true, selected_rule_ids: ["o1"] });
    expect(configBody(enableBody(normConfig({ selected_price: 0 })))).toEqual({ enabled: true });
  });
  it("sends back only picks that are still selectable, and none when the answer listed no selectable rules", () => {
    expect(selectedToSend(normConfig({ selectable_rules: [{ id: "o1" }], selected_rule_ids: ["o1", "gone"] }))).toEqual(["o1"]);
    expect(selectedToSend(normConfig({ selected_rule_ids: ["o1"] }))).toBeUndefined();
  });
});
