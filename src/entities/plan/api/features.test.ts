import { normContract, normFeatures } from "./featuresApi";

describe("plan features (TZ §12)", () => {
  it("reads unlimited, limited and locked features as the backend sends them", () => {
    const f = normFeatures({
      subscription_id: "s1", plan_version: 1, active: true,
      items: [
        { feature_key: "template_download", mode: "unlimited", allowed: true, limit: null, used: 0, remaining: null, resets_at: "2027-01-15T20:58:53Z" },
        { feature_key: "ai_requests", mode: "limited", allowed: true, limit: 20, used: 5, remaining: 15 },
        { feature_key: "doc_analysis", mode: "limited", allowed: false, limit: 0 },
        { feature_key: "", mode: "unlimited" },
      ],
    });
    expect(f.subscriptionId).toBe("s1");
    expect(f.items.map((i) => [i.key, i.mode, i.limit, i.used, i.remaining])).toEqual([["template_download", "unlimited", null, 0, null], ["ai_requests", "limited", 20, 5, 15], ["doc_analysis", "unavailable", 0, null, null]]);
  });
  it("is empty without a subscription", () => {
    expect(normFeatures({ subscription_id: null, items: [], active: false })).toEqual({ subscriptionId: "", planVersion: null, active: false, items: [] });
  });
  it("reads the contract's names and the renewal consent state", () => {
    const c = normContract({ subscription_id: "s1", renewal_terms_changed: true, renewal_consent: { accepted: false }, snapshot: { title: "Pro", version: 2, meta: { name: { uz: "Pro tarif", ru: "Про" } } } }, "s1");
    expect(c).toEqual({ subscriptionId: "s1", title: "Pro", names: { uz: "Pro tarif", ru: "Про" }, version: 2, termsChanged: true, consentAccepted: false });
    expect(normContract({}, "x").consentAccepted).toBeNull();
  });
});
