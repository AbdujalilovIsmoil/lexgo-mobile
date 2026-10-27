import { normContract, normFeatures } from "./featuresApi";
import { findByKey, normTerms } from "../lib/terms";

describe("plan features (TZ §13.1)", () => {
  it("reads unlimited, limited, used-up and locked features as the backend sends them", () => {
    const f = normFeatures({
      subscription_id: "s1", plan_id: "p1", plan_version: 1, active: true,
      items: [
        { feature_key: "template_download", mode: "unlimited", allowed: true, limit: null, used: 0, remaining: null, resets_at: "2027-01-15T20:58:53Z" },
        { feature_key: "ai_requests", mode: "limited", allowed: true, limit: 20, used: 5, remaining: 15, unit: "request" },
        { feature_key: "ai_document_analysis", mode: "limited", allowed: false, limit: 5, used: 5, remaining: 0, unit: "document", resets_at: "2026-11-24T00:00:00+00:00" },
        { feature_key: "doc_analysis", mode: "limited", allowed: false, limit: 0 },
        { feature_key: "export", mode: "unavailable" },
        { feature_key: "", mode: "unlimited" },
      ],
    });
    expect(f.subscriptionId).toBe("s1");
    expect(f.planId).toBe("p1");
    expect(f.items.map((i) => [i.key, i.mode, i.allowed, i.limit, i.used, i.remaining])).toEqual([
      ["template_download", "unlimited", true, null, 0, null],
      ["ai_requests", "limited", true, 20, 5, 15],
      ["ai_document_analysis", "limited", false, 5, 5, 0], // used up, still a counter (not "not in the plan")
      ["doc_analysis", "unavailable", false, 0, null, null],
      ["export", "unavailable", true, null, null, null],
    ]);
    expect(f.items[2]).toMatchObject({ unit: "document", resetsAt: "2026-11-24T00:00:00+00:00" });
  });

  it("is empty without a subscription", () => {
    expect(normFeatures({ subscription_id: null, items: [], active: false })).toEqual({ subscriptionId: "", planId: "", planVersion: null, active: false, consentRequired: false, items: [] });
  });

  it("carries the renewal consent flag when the features answer has it", () => {
    expect(normFeatures({ subscription_id: "s1", renewal_consent_required: true, items: [] }).consentRequired).toBe(true);
  });
});

describe("contract terms", () => {
  it("reads entitlement rows and the older key → value map", () => {
    expect(normTerms([{ feature_key: "ai_requests", mode: "limited", limit: 100, reset_period: "rolling_30_days", unit: "request" }, { feature_key: "export", mode: "unlimited", limit: null }, { mode: "limited" }])).toEqual([
      { key: "ai_requests", mode: "limited", limit: 100, unit: "request", resetPeriod: "rolling_30_days" },
      { key: "export", mode: "unlimited", limit: null, unit: "", resetPeriod: "" },
    ]);
    expect(normTerms({ ai_requests: 100, export: true, case_law_search: false, doc_analysis: 0 }).map((x) => [x.key, x.mode, x.limit])).toEqual([
      ["ai_requests", "limited", 100], ["export", "unlimited", null], ["case_law_search", "unavailable", null], ["doc_analysis", "unavailable", 0],
    ]);
  });

  it("finds a feature under its older catalogue key", () => {
    const terms = normTerms([{ feature_key: "doc_analysis", mode: "limited", limit: 20 }, { feature_key: "manual_document_fill", mode: "unlimited" }]);
    expect(findByKey(terms, "ai_document_analysis")?.limit).toBe(20);
    expect(findByKey(terms, "document_constructor")?.mode).toBe("unlimited");
    expect(findByKey(terms, "template_download")).toBeUndefined();
  });
});

describe("subscription contract (TZ §13.2, Studio tariffs §6)", () => {
  const snapshot = {
    title: "Pro", version: 2, meta: { name: { uz: "Pro tarif", ru: "Про", en: " " } },
    prices: { monthly: 99000, six_month: 564300 },
    entitlements: [{ feature_key: "ai_requests", mode: "limited", limit: 1000, unit: "request" }, { feature_key: "export", mode: "unlimited" }],
  };

  it("reads the snapshot bought for this period: names, version, prices and terms", () => {
    const c = normContract({ subscription_id: "s1", plan_id: "p1", status: "active", billing_period: "six_month", snapshot }, "x");
    expect(c).toMatchObject({ subscriptionId: "s1", planId: "p1", status: "active", title: "Pro", names: { uz: "Pro tarif", ru: "Про" }, version: 2, billingPeriod: "six_month", prices: { monthly: 99000, six_month: 564300 } });
    expect(c.terms.map((x) => [x.key, x.mode, x.limit])).toEqual([["ai_requests", "limited", 1000], ["export", "unlimited", null]]);
    expect(c).toMatchObject({ termsChanged: false, consentRequired: false, consentAccepted: null, next: null });
  });

  it("asks for consent when the backend marks renewal_consent_required, and carries the new version's terms", () => {
    const c = normContract({
      subscription_id: "s1", renewal_consent_required: true, renewal_terms_changed: true, renewal_consent: { accepted: false }, snapshot,
      current_plan_version: { version: 3, payload: { entitlements: [{ feature_key: "ai_requests", mode: "limited", limit: 500 }], prices: { six_month: 600000 } } },
    }, "s1");
    expect(c.consentRequired).toBe(true);
    expect(c.consentAccepted).toBe(false);
    expect(c.next).toEqual({ version: 3, terms: [{ key: "ai_requests", mode: "limited", limit: 500, unit: "", resetPeriod: "" }], prices: { six_month: 600000 } });
  });

  it("reads the consent flag from the subscription or its status too", () => {
    expect(normContract({ subscription: { renewal_consent_required: true } }, "s1").consentRequired).toBe(true);
    expect(normContract({ status: "renewal_consent_required" }, "s1").consentRequired).toBe(true);
    expect(normContract({ renewal_consent: { accepted: true }, renewal_terms_changed: true }, "s1")).toMatchObject({ consentRequired: false, termsChanged: true, consentAccepted: true });
  });

  it("is tolerant of an empty answer", () => {
    expect(normContract({}, "x")).toMatchObject({ subscriptionId: "x", planId: "", title: "", version: null, billingPeriod: null, terms: [], prices: {}, consentAccepted: null, next: null });
  });
});
