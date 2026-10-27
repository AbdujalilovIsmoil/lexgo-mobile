import { normGroups, normPages, normRecord, normTree } from "../api/norm";
import { EXP_STAGES, type ExpPositionInput } from "../model/types";
import { cardOf } from "./card";
import { expIssues, strayValues } from "./validate";

const rec = (p: Record<string, unknown>) => ({ id: "r1", root_id: "root", version: 1, status: "approved", category_id: "c1", workplace: "Advokatlik byurosi", position: "Advokat", started_at: "2015-01-01T00:00:00Z", ended_at: null, description: "x", ...p });
const one = (p: Record<string, unknown>) => normRecord(rec(p))!;
const row = (p: Partial<ExpPositionInput>): ExpPositionInput => ({ key: "k", title: "Advokat", startedOn: "2015-01-01", endedOn: "", isCurrent: true, description: "", ...p });

describe("experience (TZ Gaps Closed §3)", () => {
  it("reads the backend groups", () => {
    const g = normGroups({ groups: [{ root_id: "root", current: rec({}), pending_revision: rec({ id: "r2", version: 2, status: "pending_review" }), latest: rec({ id: "r2", version: 2, status: "pending_review" }), revision_count: 2 }] });
    expect(g).toHaveLength(1);
    expect(g[0].current?.status).toBe("approved");
    expect(g[0].pending?.id).toBe("r2");
    expect(g[0].current?.positions[0].isCurrent).toBe(true);
  });
  it("groups flat revisions by root: verified, under review, newest", () => {
    const g = normGroups({ items: [rec({ id: "a", version: 1 }), rec({ id: "b", version: 2, status: "pending" }), rec({ id: "x", root_id: "other", status: "rejected", rejection_reason: "Hujjat yo'q" })] });
    const root = g.find((x) => x.rootId === "root");
    expect(root?.current?.id).toBe("a");
    expect(root?.pending?.id).toBe("b");
    expect(root?.latest?.id).toBe("b");
    expect(g.find((x) => x.rootId === "other")?.latest?.rejectionReason).toBe("Hujjat yo'q");
    expect(normGroups({ items: [], groups: [] })).toEqual([]);
  });
  it("merges an entry that comes back on two pages", () => {
    const p1 = { groups: [{ root_id: "root", current: rec({ id: "a" }), latest: rec({ id: "a" }), revision_count: 2 }], has_more: true, count: 1 };
    const p2 = { groups: [{ root_id: "root", pending_revision: rec({ id: "b", version: 2, status: "pending_review" }), latest: rec({ id: "b", version: 2, status: "pending_review" }), revision_count: 2 }, { root_id: "r9", latest: rec({ id: "z", root_id: "r9", status: "rejected" }) }] };
    const g = normPages([p1, p2]);
    expect(g.map((x) => x.rootId)).toEqual(["root", "r9"]);
    expect([g[0].current?.id, g[0].pending?.id, g[0].latest?.id, g[0].revisionCount]).toEqual(["a", "b", "b", 2]);
    // Without groups the revisions of all pages are grouped at once; a revision sent twice counts once.
    const flat = normPages([{ items: [rec({ id: "a" })], has_more: true }, { items: [rec({ id: "b", version: 2, status: "rejected" }), rec({ id: "a" })] }]);
    expect(flat).toHaveLength(1);
    expect([flat[0].current?.id, flat[0].latest?.id, flat[0].revisionCount]).toEqual(["a", "b", 2]);
  });
  it("keeps every evidence file: objects, bare ids and evidence_ids", () => {
    const r = one({ evidence: [{ id: "e1", file_name: "litsenziya.pdf", mime_type: "application/pdf", size: 1200, download_url: "/marketplace/experience/evidence/e1" }, "e2"], evidence_ids: ["e1", "e3"] });
    expect(r.evidence.map((e) => e.id)).toEqual(["e1", "e2", "e3"]);
    expect(r.evidence[0]).toEqual({ id: "e1", fileName: "litsenziya.pdf", mime: "application/pdf", size: 1200, downloadUrl: "/marketplace/experience/evidence/e1" });
    expect(r.evidence[2]).toEqual({ id: "e3", fileName: "", mime: "", size: 0, downloadUrl: "/marketplace/experience/evidence/e3" });
    expect(one({ evidence_ids: ["a b"] }).evidence[0].downloadUrl).toBe("/marketplace/experience/evidence/a%20b");
    expect(one({ evidence: [{ name: "no id" }] }).evidence).toEqual([]);
  });
  it("keeps stage and result values the app does not know, so the form can show them", () => {
    const r = one({ stages: ["court", "investigation"], results: ["full_success", "won"] });
    expect(r.stages).toEqual(["court", "investigation"]);
    expect(strayValues(r.stages, EXP_STAGES)).toEqual(["court"]);
    expect(strayValues(["appeal"], EXP_STAGES)).toEqual([]);
  });
  it("counts only approved experience for the price", () => {
    expect(one({}).affectsPricing).toBe(true);
    expect(one({ status: "pending_review" }).affectsPricing).toBe(false);
    expect(one({ affects_pricing: false }).affectsPricing).toBe(false);
    expect(one({ status: "superseded_pending_revision" }).status).toBe("superseded");
    expect(one({ status: "canceled" }).status).toBe("cancelled");
  });
  it("reads the public category tree with real child ids", () => {
    const tree = [{ id: "r", parent_id: null, title: "Jinoiy", children: [{ id: "c", parent_id: "r", title: "Advokat bilan ariza", children: [] }, { id: "x", title: "Eski", is_active: false }] }, { id: "", title: "no id" }, { id: "off", title: "Off", is_active: false }];
    expect(normTree(tree)).toEqual([{ id: "r", title: "Jinoiy", children: [{ id: "c", title: "Advokat bilan ariza" }] }]);
    expect(normTree({ items: tree })).toHaveLength(1);
  });
  it("checks the form like the web does", () => {
    const base = { sourceId: "", categoryId: "c1", subcategoryId: "", workplace: "Byuro", positions: [row({})], description: "Jinoyat ishlari bo'yicha tergov va sud bosqichlarida himoya", stages: [], results: [], evidenceIds: [] };
    expect(expIssues(base, "2026-10-24")).toEqual([]);
    expect(expIssues({ ...base, categoryId: "", workplace: " ", positions: [row({ startedOn: "2027-01-01" })] }, "2026-10-24")).toEqual(["category", "workplace", "positions"]);
    expect(expIssues({ ...base, positions: [row({ isCurrent: false, endedOn: "2014-01-01" })] }, "2026-10-24")).toEqual(["positions"]);
    expect(expIssues({ ...base, description: "qisqa" }, "2026-10-24")).toEqual(["description"]);
    expect(expIssues({ ...base, description: "Bog'laning: +998 90 123 45 67, tergov va sud bosqichlari" }, "2026-10-24")).toEqual(["contacts"]);
  });
  it("flags a category or direction the tree no longer has", () => {
    const base = { sourceId: "", categoryId: "c1", subcategoryId: "s1", workplace: "Byuro", positions: [row({})], description: "Jinoyat ishlari bo'yicha tergov va sud bosqichlarida himoya", stages: [], results: [], evidenceIds: [] };
    const tree = [{ id: "c1", title: "Jinoiy", children: [{ id: "s1", title: "Ariza" }] }];
    expect(expIssues(base, "2026-10-24", tree)).toEqual([]);
    expect(expIssues({ ...base, subcategoryId: "Ariza" }, "2026-10-24", tree)).toEqual(["subcategory"]);
    expect(expIssues({ ...base, categoryId: "gone", subcategoryId: "" }, "2026-10-24", tree)).toEqual(["category"]);
    expect(expIssues({ ...base, categoryId: "gone" }, "2026-10-24", [])).toEqual([]); // no tree yet: the server decides
  });
});

describe("experience card: the verified data stays, a newer revision is a note", () => {
  const approved = one({ id: "a", version: 1 });
  it("an approved entry whose newest edit was rejected", () => {
    const rejected = one({ id: "b", version: 2, status: "rejected", position: "Katta advokat", rejection_reason: "Hujjat yo'q" });
    const c = cardOf({ rootId: "root", current: approved, pending: null, latest: rejected, revisionCount: 2 })!;
    expect([c.shown.id, c.state, c.pendingId]).toEqual(["a", "approved", ""]);
    expect(c.note).toEqual({ kind: "rejected", record: rejected, changed: ["positions"], positions: { added: [], removed: [], edited: ["Advokat → Katta advokat"] } });
  });
  it("a cancelled edit leaves the verified data and says so", () => {
    const cancelled = one({ id: "b", version: 2, status: "cancelled", description: "boshqa" });
    const c = cardOf({ rootId: "root", current: approved, pending: null, latest: cancelled, revisionCount: 2 })!;
    expect([c.shown.id, c.state, c.note?.kind]).toEqual(["a", "approved", "cancelled"]);
  });
  it("an edit under review can be withdrawn; the verified data shows meanwhile", () => {
    const pending = one({ id: "b", version: 2, status: "pending_review", stages: ["appeal"] });
    const c = cardOf({ rootId: "root", current: approved, pending, latest: pending, revisionCount: 2 })!;
    expect([c.shown.id, c.state, c.note?.kind, c.pendingId, c.note?.changed]).toEqual(["a", "approved", "pending", "b", ["stages"]]);
  });
  it("without a verified revision the newest one is shown with its own state", () => {
    const cancelled = one({ id: "x", status: "cancelled" });
    expect(cardOf({ rootId: "x", current: null, pending: null, latest: cancelled, revisionCount: 1 })).toMatchObject({ state: "cancelled", note: null, pendingId: "" });
    const pending = one({ id: "y", status: "pending_review" });
    expect(cardOf({ rootId: "y", current: null, pending: null, latest: pending, revisionCount: 1 })).toMatchObject({ state: "pending", pendingId: "y" });
    expect(cardOf({ rootId: "z", current: null, pending: null, latest: null, revisionCount: 0 })).toBeNull();
  });
});
