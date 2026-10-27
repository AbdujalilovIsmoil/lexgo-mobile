import { ApiError, parseErrorBody } from "@/shared/api";
import { translate } from "@/shared/i18n";
import type { Plan } from "../model/types";
import type { PlanFeature } from "../model/features";
import { GATE_CODES, gateOfFeature, liftsGate, planGateOf } from "./planGate";
import { normTerms } from "./terms";

const exhausted = { detail: { code: "feature_limit_exhausted", feature_key: "ai_document_analysis", mode: "limited", allowed: false, limit: 5, used: 5, remaining: 0, unit: "document", resets_at: "2026-11-24T00:00:00+00:00" } };

describe("402 subscription usage limits (TZ.md)", () => {
  it("reads feature_limit_exhausted with the feature, used / limit and the reset", () => {
    expect(planGateOf(parseErrorBody(402, exhausted))).toEqual({ code: "feature_limit_exhausted", featureKey: "ai_document_analysis", limit: 5, used: 5, remaining: 0, unit: "document", resetsAt: "2026-11-24T00:00:00+00:00", message: "" });
  });

  it("keeps each of the other codes apart", () => {
    for (const code of ["active_subscription_required", "feature_not_in_plan", "ai_subscription_required"]) {
      expect(planGateOf(parseErrorBody(402, { detail: { code, feature_key: "document_constructor" } }))?.code).toBe(code);
    }
  });

  it("gives ai_subscription_required the AI requests feature and reads its monthly limit", () => {
    expect(planGateOf(parseErrorBody(402, { detail: { code: "ai_subscription_required", used: 100, monthly_limit: 100 } }))).toMatchObject({ code: "ai_subscription_required", featureKey: "ai_requests", used: 100, limit: 100 });
  });

  it("maps the document-settings refusals onto the same codes", () => {
    expect(planGateOf(parseErrorBody(402, { detail: { code: "document_subscription_required" } }))?.code).toBe("active_subscription_required");
    expect(planGateOf(parseErrorBody(402, { detail: { code: "document_entitlement_required" } }))?.code).toBe("feature_not_in_plan");
  });

  it("leaves the document-settings refusals no plan lifts to the document screens", () => {
    expect(planGateOf(parseErrorBody(402, { detail: { code: "document_mode_disabled" } }))).toBeNull();
    expect(planGateOf(parseErrorBody(402, { detail: { code: "document_download_format_disabled" } }))).toBeNull();
  });

  it("keeps the server's sentence for an older or unknown 402", () => {
    expect(planGateOf(parseErrorBody(402, { detail: { code: "manual_document_plan_required", message: "Paket kerak" } }))).toMatchObject({ code: "plan_required", featureKey: "manual_document_fill", message: "Paket kerak" });
    expect(planGateOf(parseErrorBody(402, { detail: "Pay first" }))).toMatchObject({ code: "plan_required", featureKey: "", message: "Pay first" });
  });

  it("is null for anything but a 402", () => {
    expect(planGateOf(parseErrorBody(403, exhausted))).toBeNull();
    expect(planGateOf(new ApiError(0, "network_error"))).toBeNull();
    expect(planGateOf(new Error("x"))).toBeNull();
    expect(planGateOf(null)).toBeNull();
  });

  it("has a title and a reason in every language for every code", () => {
    for (const l of ["uz", "ru", "en"] as const) {
      for (const code of GATE_CODES) {
        expect(translate(l, `subq.gate.title.${code}`)).not.toBe(`subq.gate.title.${code}`);
        expect(translate(l, `subq.gate.any.${code}`)).not.toBe(`subq.gate.any.${code}`);
      }
      for (const code of ["feature_limit_exhausted", "active_subscription_required", "feature_not_in_plan"]) {
        expect(translate(l, `subq.gate.text.${code}`, { feature: "X" })).toContain("X");
      }
    }
  });
});

describe("the backend's feature state as a gate", () => {
  const f = (over: Partial<PlanFeature>): PlanFeature => ({ key: "template_download", mode: "unlimited", allowed: true, limit: null, used: null, remaining: null, unit: "", resetsAt: "", ...over });

  it("stops a locked feature and a used-up limit, lets the rest through", () => {
    expect(gateOfFeature(f({ mode: "unavailable" }), "template_download")).toMatchObject({ code: "feature_not_in_plan", featureKey: "template_download" });
    expect(gateOfFeature(f({ mode: "limited", limit: 3, used: 3, remaining: 0, resetsAt: "2026-11-01" }), "template_download")).toMatchObject({ code: "feature_limit_exhausted", limit: 3, used: 3, remaining: 0, resetsAt: "2026-11-01" });
    expect(gateOfFeature(f({ mode: "limited", limit: 3, used: 3, remaining: null, allowed: false }), "template_download")?.code).toBe("feature_limit_exhausted");
    expect(gateOfFeature(f({ mode: "limited", limit: 3, used: 1, remaining: 2 }), "template_download")).toBeNull();
    expect(gateOfFeature(f({}), "template_download")).toBeNull();
    expect(gateOfFeature(null, "template_download")).toBeNull();
  });
});

describe("which tariffs lift a gate", () => {
  const plan = (slug: string, contract: unknown): Plan => ({ id: slug, slug, name: slug, contract: normTerms(contract) } as Plan);
  const lite = plan("lexgo-ai-lite", [{ feature_key: "ai_requests", mode: "limited", limit: 100 }, { feature_key: "doc_analysis", mode: "limited", limit: 5 }]);
  const pro = plan("lexgo-ai-pro", [{ feature_key: "ai_requests", mode: "limited", limit: 1000 }, { feature_key: "doc_analysis", mode: "limited", limit: 20 }, { feature_key: "template_download", mode: "unlimited" }, { feature_key: "manual_document_fill", mode: "unlimited" }]);
  const standard = plan("shaxsiy-advokat-standard", [{ feature_key: "template_download", mode: "unlimited" }, { feature_key: "manual_document_fill", mode: "unlimited" }]);
  const lifting = (body: unknown) => [lite, pro, standard].filter((p) => liftsGate(p, planGateOf(parseErrorBody(402, body))!)).map((p) => p.slug);

  it("a used-up limit: only tariffs with more of the same feature (its older catalogue key included)", () => {
    expect(lifting(exhausted)).toEqual(["lexgo-ai-pro"]);
  });

  it("a feature not in the plan: every tariff that gives it — not the manual-documents ones for AI analysis", () => {
    expect(lifting({ detail: { code: "feature_not_in_plan", feature_key: "ai_document_analysis" } })).toEqual(["lexgo-ai-lite", "lexgo-ai-pro"]);
    expect(lifting({ detail: { code: "feature_not_in_plan", feature_key: "template_download" } })).toEqual(["lexgo-ai-pro", "shaxsiy-advokat-standard"]);
    expect(lifting({ detail: { code: "active_subscription_required", feature_key: "document_constructor" } })).toEqual(["lexgo-ai-pro", "shaxsiy-advokat-standard"]);
  });

  it("the AI limit: tariffs with more AI requests than the one used up", () => {
    expect(lifting({ detail: { code: "ai_subscription_required", used: 100, monthly_limit: 100 } })).toEqual(["lexgo-ai-pro"]);
  });

  it("the older manual-documents 402 keeps its tariffs; a gate without a feature lifts by none (the tariffs page instead)", () => {
    expect(lifting({ detail: { code: "manual_document_plan_required", message: "x" } })).toEqual(["lexgo-ai-pro", "shaxsiy-advokat-standard"]);
    expect(lifting({ detail: { code: "active_subscription_required" } })).toEqual([]);
  });
});
