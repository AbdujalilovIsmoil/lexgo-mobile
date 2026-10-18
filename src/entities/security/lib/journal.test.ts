import { EMPTY_FILTER, activeFilterCount, countKinds, dayOf, filterChips, filterJournal, fromActivity, fromEvent, groupByDay, inPeriod, kindIcon, kindOfActivity, kindOfEvent, mergeJournal, pageWindow, removeChip, toggleKind, JOURNAL_KINDS, type JournalEntry } from "./journal";

const NOW = new Date(2026, 9, 19, 15, 0).getTime();
const at = (daysBack: number, h = 10) => new Date(2026, 9, 19 - daysBack, h, 0).getTime();
const mk = (id: string, kind: JournalEntry["kind"], ts: number, extra: Partial<JournalEntry> = {}): JournalEntry => ({
  id, source: "activity", kind, key: id, title: "", detail: "", ip: "", fromIp: "", agent: "", outcome: "", failed: false, createdAt: new Date(ts).toISOString(), ts, ...extra,
});

describe("kinds", () => {
  it("maps audit actions", () => {
    expect(kindOfActivity("login")).toBe("auth");
    expect(kindOfActivity("2fa_enable")).toBe("protect");
    expect(kindOfActivity("session_revoke")).toBe("protect");
    expect(kindOfActivity("order_create")).toBe("orders");
    expect(kindOfActivity("document_request_create")).toBe("documents");
    expect(kindOfActivity("consent_accept")).toBe("profile");
    expect(kindOfActivity("ai_assistant")).toBe("other");
  });
  it("maps events and flags the bad ones", () => {
    expect(kindOfEvent("suspicious_login")).toBe("alerts");
    expect(kindOfEvent("login")).toBe("auth");
    expect(kindOfEvent("password_changed")).toBe("protect");
    expect(fromEvent({ id: "1", type: "suspicious_login", title: "", status: "", fromIp: "1", ip: "2", agent: "", createdAt: "2026-10-19T10:00:00Z" }).failed).toBe(true);
    expect(fromActivity({ id: "1", action: "login", detail: "", titleUz: "", descriptionUz: "", ip: "", outcome: "failure", createdAt: "" }).failed).toBe(true);
    expect(fromActivity({ id: "1", action: "login", detail: "", titleUz: "", descriptionUz: "", ip: "", outcome: "success", createdAt: "" }).failed).toBe(false);
  });
  it("has an icon for every kind", () => {
    for (const k of JOURNAL_KINDS) expect(kindIcon(k)).toBeTruthy();
  });
});

describe("merge, filter, chips", () => {
  const all = [mk("a", "auth", at(0)), mk("b", "orders", at(1)), mk("c", "auth", at(5)), mk("d", "other", at(40))];
  it("merges newest first", () => {
    const m = mergeJournal([{ id: "1", action: "login", detail: "", titleUz: "", descriptionUz: "", ip: "", outcome: "", createdAt: "2026-10-01T00:00:00Z" }], [{ id: "1", type: "login", title: "", status: "", fromIp: "", ip: "", agent: "", createdAt: "2026-10-02T00:00:00Z" }]);
    expect(m.map((e) => e.id)).toEqual(["e:1", "a:1"]);
  });
  it("filters by period", () => {
    expect(inPeriod(at(0, 1), "today", NOW)).toBe(true);
    expect(inPeriod(at(1), "today", NOW)).toBe(false);
    expect(filterJournal(all, { ...EMPTY_FILTER, period: "7d" }, NOW).map((e) => e.id)).toEqual(["a", "b", "c"]);
    expect(filterJournal(all, { ...EMPTY_FILTER, period: "30d" }, NOW)).toHaveLength(3);
  });
  it("filters by kinds and search", () => {
    expect(filterJournal(all, { ...EMPTY_FILTER, kinds: ["auth"] }, NOW)).toHaveLength(2);
    expect(filterJournal(all, { ...EMPTY_FILTER, kinds: ["auth", "orders"] }, NOW)).toHaveLength(3);
    expect(filterJournal([mk("x", "auth", at(0), { ip: "10.0.0.7" })], { ...EMPTY_FILTER, q: " 10.0.0 " }, NOW)).toHaveLength(1);
  });
  it("counts kinds ignoring the kind selection", () => {
    const n = countKinds(all, { kinds: ["orders"], period: "7d", q: "" }, NOW);
    expect(n.auth).toBe(2);
    expect(n.orders).toBe(1);
    expect(n.other).toBe(0);
  });
  it("toggles kinds and builds removable chips", () => {
    expect(toggleKind(["auth"], "orders")).toEqual(["auth", "orders"]);
    expect(toggleKind(["auth", "orders"], "auth")).toEqual(["orders"]);
    const f = { kinds: ["auth" as const, "protect" as const], period: "7d" as const, q: "" };
    const chips = filterChips(f);
    expect(chips.map((c) => c.id)).toEqual(["k:auth", "k:protect", "period"]);
    expect(activeFilterCount(f)).toBe(3);
    expect(removeChip(f, chips[0])).toEqual({ ...f, kinds: ["protect"] });
    expect(removeChip(f, chips[2]).period).toBe("all");
    expect(filterChips(EMPTY_FILTER)).toEqual([]);
  });
});

describe("day grouping", () => {
  it("labels today, yesterday and older days", () => {
    expect(dayOf(at(0, 1), NOW)).toEqual({ kind: "today" });
    expect(dayOf(at(1, 23), NOW)).toEqual({ kind: "yesterday" });
    expect(dayOf(at(3), NOW)).toEqual({ kind: "date", iso: "2026-10-16" });
  });
  it("groups consecutive entries by calendar day", () => {
    const g = groupByDay([mk("a", "auth", at(0, 14)), mk("b", "auth", at(0, 9)), mk("c", "auth", at(1)), mk("d", "auth", at(4))], NOW);
    expect(g.map((x) => [x.id, x.entries.length])).toEqual([["today", 2], ["yesterday", 1], ["2026-10-15", 1]]);
  });
});

describe("paging window", () => {
  it("reveals 10 at a time", () => {
    expect(pageWindow(124, 10)).toEqual({ count: 10, remaining: 114, next: 10, hasMore: true });
    expect(pageWindow(14, 10)).toEqual({ count: 10, remaining: 4, next: 4, hasMore: true });
    expect(pageWindow(14, 20)).toEqual({ count: 14, remaining: 0, next: 0, hasMore: false });
    expect(pageWindow(0, 10).hasMore).toBe(false);
  });
});
