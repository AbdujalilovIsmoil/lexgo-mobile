import { ApiError } from "@/shared/api";
import { serviceErrorKey, serviceErrorOf } from "./errors";

describe("service errors", () => {
  it("names the message of each error kind", () => {
    expect(serviceErrorKey("forbidden")).toBe("proSvc.errors.forbidden");
    expect(serviceErrorKey("pendingAccount")).toBe("proSvc.errors.pendingAccount");
    expect(serviceErrorKey("range")).toBe("proSvc.errors.range");
    expect(serviceErrorKey("rules")).toBe("svcRules.rulesLockReason");
    expect(serviceErrorKey("conflict")).toBe("scfg.errConflict");
  });
  it("422 with a zero ceiling means the catalogue has no price; with a ceiling it is a range", () => {
    const e = (limits: object) => new ApiError(422, "x", { data: { detail: { pricing_limits: limits } } });
    expect(serviceErrorOf(e({ max_allowed: 0, min_allowed: 0 })).kind).toBe("noPrice");
    const r = serviceErrorOf(e({ max_allowed: 100, min_allowed: 70 }));
    expect([r.kind, r.limits?.max]).toEqual(["range", 100]);
    expect(serviceErrorOf(new ApiError(422, "bad")).kind).toBe("invalid");
  });
  it("a 409 branches on detail.code: missing rules carry their ids, anything else is a conflict", () => {
    const rules = new ApiError(409, "Accept the rules", { code: "service_rules_acceptance_required", data: { detail: { code: "service_rules_acceptance_required", missing_rule_ids: ["r1", "r2"] } } });
    expect(serviceErrorOf(rules)).toMatchObject({ kind: "rules", missing: ["r1", "r2"] });
    expect(serviceErrorOf(new ApiError(409, "service_rules_acceptance_required", { data: { detail: "service_rules_acceptance_required" } })).kind).toBe("rules");
    expect(serviceErrorOf(new ApiError(409, "busy", { code: "something_else" })).kind).toBe("conflict");
  });
  it("a non-API failure is unknown", () => expect(serviceErrorOf(new Error("x")).kind).toBe("unknown"));
});
