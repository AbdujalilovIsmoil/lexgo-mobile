import { normPackage } from "./normalize";
import { countStates, groupRows, matchesFilter, reasonKey, stateOf } from "../lib/state";

const row = (o: Record<string, unknown>) => normPackage({ package_id: "p", package: { id: "p", package_code: "BIZ", title: "Biz", tariff: "basic", price: 100, category_title: "Business", included: ["A", "B"] }, ...o });

describe("seller package normalisation", () => {
  it("maps the nested package and eligibility", () => {
    const p = row({ enabled: true, status: "active", eligibility: { eligible: false, extended_verified: true, reasons: ["extended_verification_required"], missing_service_ids: ["s1"] } });
    expect(p).toMatchObject({ id: "p", enabled: true, status: "active", priceEditable: false });
    expect(p.pkg).toMatchObject({ code: "BIZ", tariff: "BASIC", category: "Business", included: ["A", "B"] });
    expect(p.eligibility).toMatchObject({ eligible: false, extendedVerified: true, reasons: ["extended_verification_required"], missingServiceIds: ["s1"] });
  });
  it("a not enabled row is disabled; a flat row works; eligibility defaults to eligible", () => {
    expect(row({}).status).toBe("disabled");
    const flat = normPackage({ id: "f1", title: "Flat", tariff: "PREMIUM", enabled: true, status: "paused" });
    expect(flat).toMatchObject({ id: "f1", status: "disabled" });
    expect(flat.eligibility.eligible).toBe(true);
  });
});

describe("seller package state", () => {
  const mk = (id: string, tariff: string, over: Record<string, unknown>) => normPackage({ id, package_code: "G", title: "Group", tariff, ...over });
  const items = [mk("1", "PREMIUM", { enabled: true, status: "active" }), mk("2", "BASIC", { enabled: true, status: "disabled" }), mk("3", "STANDARD", {}), mk("4", "STANDARD", { eligibility: { eligible: false } })];
  it("derives the four states", () => {
    expect(items.map(stateOf)).toEqual(["active", "paused", "available", "blocked"]);
  });
  it("counts paused rows as enabled", () => {
    expect(countStates(items)).toEqual({ all: 4, active: 2, available: 1, blocked: 1 });
    expect(matchesFilter("paused", "active")).toBe(true);
    expect(matchesFilter("blocked", "available")).toBe(false);
  });
  it("groups by code, sorts tariffs, filters and searches", () => {
    const g = groupRows(items, "all", "");
    expect(g).toHaveLength(1);
    expect(g[0].rows.map((r) => r.pkg.tariff)).toEqual(["BASIC", "STANDARD", "STANDARD", "PREMIUM"]);
    expect(groupRows(items, "blocked", "")[0].rows).toHaveLength(1);
    expect(groupRows(items, "all", "zzz")).toEqual([]);
  });
  it("only known reason codes get a translation key", () => {
    expect(reasonKey("provider_tier_mismatch")).toBe("pkgSeller.reasons.provider_tier_mismatch");
    expect(reasonKey("weird")).toBeNull();
  });
});
