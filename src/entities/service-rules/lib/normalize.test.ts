import { isFuture, normAccept, normRule, normRules, pendingCount } from "./normalize";

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
});
