import { normGroups, normRecord } from "../api/norm";
import { normHistory } from "../api/normHistory";
import type { ExpPosition, ExpPositionInput } from "../model/types";
import { timelineOf } from "./card";
import { checkEvidence } from "./evidenceRules";
import { headIndex, newestFirst, periodOf, positionDiff } from "./positions";
import { expIssues, posIssues } from "./validate";

const P = (title: string, from: string, to: string, p: Partial<ExpPosition> = {}): ExpPosition => ({ title, startedAt: `${from}T00:00:00Z`, endedAt: to ? `${to}T00:00:00Z` : "", isCurrent: !to, description: "", ...p });
const row = (p: Partial<ExpPositionInput>): ExpPositionInput => ({ key: "k", title: "Advokat", startedOn: "2019-01-01", endedOn: "2022-01-01", isCurrent: false, description: "", ...p });
const base = { id: "r1", root_id: "root", version: 1, status: "approved", category_id: "c1", workplace: "Byuro" };

describe("positions are read from every answer", () => {
  it("takes positions[] and lists them newest first", () => {
    const r = normRecord({ ...base, positions: [{ title: "Advokat", started_at: "2019-01-01T00:00:00Z", ended_at: "2022-01-01T00:00:00Z", is_current: false }, { title: "Katta advokat", started_at: "2022-01-01T00:00:00Z", ended_at: null, is_current: true, description: "Rahbar" }] })!;
    expect(r.positions.map((p) => [p.title, p.isCurrent, p.description])).toEqual([["Katta advokat", true, "Rahbar"], ["Advokat", false, ""]]);
  });
  it("falls back to the legacy single fields when positions is missing or empty", () => {
    const legacy = { position: "Advokat", started_at: "2015-01-01T00:00:00Z", ended_at: null };
    expect(normRecord({ ...base, ...legacy })!.positions).toEqual([{ title: "Advokat", startedAt: "2015-01-01T00:00:00Z", endedAt: "", isCurrent: true, description: "" }]);
    expect(normRecord({ ...base, ...legacy, positions: [] })!.positions).toHaveLength(1);
    expect(normRecord({ ...base, position: "Yurist", started_at: "2010-01-01T00:00:00Z", ended_at: "2012-01-01T00:00:00Z", is_current: false })!.positions[0]).toMatchObject({ isCurrent: false, endedAt: "2012-01-01T00:00:00Z" });
    expect(normRecord(base)!.positions).toEqual([]);
  });
  it("reads them in a list's groups and in a history's revisions", () => {
    const rec = { ...base, positions: [{ title: "A", started_at: "2019-01-01T00:00:00Z", ended_at: null, is_current: true }] };
    expect(normGroups({ groups: [{ root_id: "root", current: rec, latest: rec }] })[0].current?.positions[0].title).toBe("A");
    expect(normGroups({ items: [rec] })[0].latest?.positions).toHaveLength(1);
    expect(normHistory({ items: [rec] }).revisions[0].positions[0].title).toBe("A");
  });
});

describe("position order, period and head", () => {
  it("puts the position held now first, then the one that ended last", () => {
    const list = [P("Stajyor", "2015-01-01", "2016-01-01"), P("Katta", "2022-01-01", ""), P("Advokat", "2018-01-01", "2022-01-01"), P("Parallel", "2020-01-01", "2022-01-01")];
    expect(newestFirst(list).map((p) => p.title)).toEqual(["Katta", "Parallel", "Advokat", "Stajyor"]);
  });
  it("writes the period by years", () => {
    expect(periodOf(P("A", "2019-01-01", "2022-06-01"), "hozirgacha")).toBe("2019 – 2022");
    expect(periodOf(P("A", "2022-01-01", ""), "hozirgacha")).toBe("2022 – hozirgacha");
    expect(periodOf(P("A", "2021-02-01", "2021-09-01"), "hozirgacha")).toBe("2021");
  });
  it("chooses the position for the legacy fields: the current one, else the newest", () => {
    expect(headIndex([row({}), row({ title: "Hozir", isCurrent: true, endedOn: "" }), row({ title: "Eski", startedOn: "2010-01-01", endedOn: "2012-01-01" })])).toBe(1);
    expect(headIndex([row({ title: "Eski", startedOn: "2010-01-01", endedOn: "2012-01-01" }), row({})])).toBe(1);
    expect(headIndex([])).toBe(-1);
  });
});

describe("how a changed position list differs", () => {
  const was = [P("Advokat", "2019-01-01", "2022-01-01"), P("Maslahatchi", "2020-01-01", "2021-01-01")];
  it("names added, removed and edited positions; the order does not count", () => {
    expect(positionDiff(was, [...was].reverse())).toEqual({ added: [], removed: [], edited: [] });
    expect(positionDiff(was, [...was, P("Katta advokat", "2022-01-01", "")])).toEqual({ added: ["Katta advokat"], removed: [], edited: [] });
    expect(positionDiff(was, [was[0]])).toEqual({ added: [], removed: ["Maslahatchi"], edited: [] });
    expect(positionDiff(was, [P("Advokat", "2019-01-01", "2023-01-01"), was[1]])).toEqual({ added: [], removed: [], edited: ["Advokat"] });
    expect(positionDiff(was, [P("Katta advokat", "2019-01-01", "2022-01-01"), was[1]])).toEqual({ added: [], removed: [], edited: ["Advokat → Katta advokat"] });
  });
  it("is in the card's and the history's changed notes", () => {
    const rev = (id: string, version: number, positions: unknown[]) => ({ ...base, id, version, positions, submitted_at: `2026-10-0${version}T09:00:00Z` });
    const pos = (title: string, from: string) => ({ title, started_at: `${from}T00:00:00Z`, ended_at: null, is_current: true });
    const h = normHistory({ items: [rev("v1", 1, [pos("Advokat", "2019-01-01")]), rev("v2", 2, [pos("Advokat", "2019-01-01"), pos("Katta advokat", "2022-01-01")])] });
    const sent = timelineOf(h).filter((e) => e.kind === "sent");
    expect(sent[0]).toMatchObject({ changed: ["positions"], positions: { added: ["Katta advokat"] } });
    expect(sent[1]).toMatchObject({ changed: [], positions: { added: [], removed: [], edited: [] } });
  });
});

describe("a position is checked on its own", () => {
  it("needs a title of 2–255 characters, a start, and an end not before it unless current", () => {
    expect(posIssues(row({}), "2026-10-27")).toEqual([]);
    expect(posIssues(row({ title: " A " }), "2026-10-27")).toEqual(["title"]);
    expect(posIssues(row({ title: "x".repeat(256) }), "2026-10-27")).toEqual(["title"]);
    expect(posIssues(row({ startedOn: "" }), "2026-10-27")).toEqual(["started"]);
    expect(posIssues(row({ startedOn: "2027-01-01", isCurrent: true }), "2026-10-27")).toEqual(["started"]);
    expect(posIssues(row({ endedOn: "2018-01-01" }), "2026-10-27")).toEqual(["ended"]);
    expect(posIssues(row({ isCurrent: true, endedOn: "" }), "2026-10-27")).toEqual([]);
  });
  it("lets periods overlap or run in parallel", () => {
    const input = { sourceId: "", categoryId: "c1", subcategoryId: "", workplace: "Byuro", description: "Jinoyat ishlari bo'yicha tergov va sud bosqichlarida himoya", stages: [], results: [], evidenceIds: [] };
    const overlap = [row({ key: "a" }), row({ key: "b", title: "Maslahatchi", startedOn: "2020-01-01", endedOn: "2021-01-01" }), row({ key: "c", title: "Hozir", startedOn: "2021-06-01", endedOn: "", isCurrent: true })];
    expect(expIssues({ ...input, positions: overlap }, "2026-10-27")).toEqual([]);
  });
  it("needs 1 to 30 positions and a workplace of 2+ characters", () => {
    const input = { sourceId: "", categoryId: "c1", subcategoryId: "", workplace: "Byuro", description: "Jinoyat ishlari bo'yicha tergov va sud bosqichlarida himoya", stages: [], results: [], evidenceIds: [] };
    expect(expIssues({ ...input, positions: [] }, "2026-10-27")).toEqual(["positions"]);
    expect(expIssues({ ...input, positions: Array.from({ length: 30 }, (_, i) => row({ key: `k${i}` })) }, "2026-10-27")).toEqual([]);
    expect(expIssues({ ...input, positions: Array.from({ length: 31 }, (_, i) => row({ key: `k${i}` })) }, "2026-10-27")).toEqual(["positions"]);
    expect(expIssues({ ...input, workplace: "B", positions: [row({})] }, "2026-10-27")).toEqual(["workplace"]);
  });
});

describe("evidence files (§18)", () => {
  const f = (name: string, mime: string, size = 1000) => ({ name, mime, size });
  const MB = 1024 * 1024;
  it("takes PDF, DOC, DOCX, JPEG, PNG and WebP", () => {
    const names = [f("a.pdf", "application/pdf"), f("a.doc", "application/msword"), f("a.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"), f("a.JPG", "image/jpeg"), f("a.jpeg", "image/jpeg"), f("a.png", "image/png"), f("a.webp", "image/webp"), f("b.pdf", "application/octet-stream"), f("c.pdf", "")];
    expect(checkEvidence(names).ok).toHaveLength(names.length);
  });
  it("refuses another type by name or by stated type", () => {
    const r = checkEvidence([f("a.gif", "image/gif"), f("a.heic", "image/heic"), f("a.txt", "text/plain"), f("a.xlsx", "application/vnd.ms-excel"), f("fake.jpg", "image/gif"), f("noext", "application/pdf")]);
    expect(r.badType.map((x) => x.name)).toEqual(["a.gif", "a.heic", "a.txt", "a.xlsx", "fake.jpg", "noext"]);
    expect(r.ok).toEqual([]);
  });
  it("refuses a file over 20 MB; exactly 20 MB and an unknown size pass", () => {
    const r = checkEvidence([f("big.pdf", "application/pdf", 20 * MB + 1), f("edge.pdf", "application/pdf", 20 * MB), f("zero.pdf", "application/pdf", 0)]);
    expect(r.tooBig.map((x) => x.name)).toEqual(["big.pdf"]);
    expect(r.ok.map((x) => x.name)).toEqual(["edge.pdf", "zero.pdf"]);
  });
});
