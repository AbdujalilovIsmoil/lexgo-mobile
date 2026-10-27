import { ApiError } from "@/shared/api";
import { isFuture, normAccept, normRule, normRules, orderRules, pendingCount, rulesBlockOf } from "./normalize";

describe("service rules normaliser (web parity)", () => {
  it("reads the empty sample answer", () => {
    const s = normRules({ items: [], all_accepted: true, count: 0 });
    expect(s).toEqual({ items: [], allAccepted: true, count: 0 });
    expect(pendingCount(s)).toBe(0);
  });
  it("maps field aliases and derives accepted from accepted_at", () => {
    const r = normRule({ rule_id: " r1 ", key: "k", name: "Rules", rule_version: "2", content: "text", scope: "SERVICE", effective_from: "2026-01-01", accepted_at: "2026-02-01T00:00:00Z" });
    expect(r).toMatchObject({ id: "r1", key: "k", title: "Rules", version: "2", body: "text", scope: "service", effectiveAt: "2026-01-01", accepted: true });
  });
  it("counts pending rules and derives all_accepted when missing", () => {
    const s = normRules({ rules: [{ id: "a", accepted: true }, { id: "b" }, {}] });
    expect(s.items).toHaveLength(2);
    expect(s.allAccepted).toBe(false);
    expect(pendingCount(s)).toBe(1);
  });
  it("accept answer falls back to the rule id", () => {
    expect(normAccept({}, "x")).toMatchObject({ ruleId: "x", accepted: true, allAccepted: null });
    expect(normAccept({ rule: { id: "y", accepted: false }, all_accepted: false }, "x")).toMatchObject({ ruleId: "y", accepted: false, allAccepted: false });
  });
  it("tells future effective dates from past ones", () => {
    expect(isFuture("2030-01-01", Date.UTC(2026, 0, 1))).toBe(true);
    expect(isFuture("2020-01-01", Date.UTC(2026, 0, 1))).toBe(false);
    expect(isFuture("")).toBe(false);
  });
  it("never mixes client rules into the seller's list (TZ.md §20)", () => {
    const s = normRules({ items: [{ id: "a" }, { id: "b", audience: "client" }, { id: "c", audience: "seller" }, { id: "d", rule_audience: "Customer" }] });
    expect(s.items.map((r) => r.id)).toEqual(["a", "c"]);
  });
});

describe("rules refusal (409 service_rules_acceptance_required)", () => {
  it("reads the missing ids from detail, the body, or rule objects", () => {
    const code = "service_rules_acceptance_required";
    expect(rulesBlockOf(new ApiError(409, "x", { code, data: { detail: { code, missing_rule_ids: ["r1", " r2 ", "r1"] } } }))).toEqual(["r1", "r2"]);
    expect(rulesBlockOf(new ApiError(409, code, { data: { detail: code, missing_rule_ids: [{ id: "r3" }] } }))).toEqual(["r3"]);
    expect(rulesBlockOf(new ApiError(409, "x", { data: { detail: { code, missing_rules: [{ rule_id: "r4" }] } } }))).toEqual(["r4"]);
    expect(rulesBlockOf(new ApiError(409, "x", { code }))).toEqual([]);
  });
  it("is null for any other failure", () => {
    expect(rulesBlockOf(new ApiError(409, "x", { code: "order_not_in_review" }))).toBeNull();
    expect(rulesBlockOf(new Error("service_rules_acceptance_required"))).toBeNull();
  });
});

describe("rules sheet order", () => {
  const r = (id: string, accepted: boolean) => normRule({ id, title: id, accepted });
  it("puts the named rules first, then the other pending ones, then the accepted", () => {
    expect(orderRules([r("a", true), r("b", false), r("c", false), r("d", true)], ["c"]).map((x) => x.id)).toEqual(["c", "b", "a", "d"]);
  });
  it("adds a named rule the list does not carry, from the configuration, as not accepted", () => {
    const out = orderRules([r("a", true)], ["z"], [r("z", true)]);
    expect(out.map((x) => [x.id, x.accepted])).toEqual([["z", false], ["a", true]]);
    expect(orderRules([r("a", true)], ["unknown"]).map((x) => x.id)).toEqual(["a"]);
  });
});
