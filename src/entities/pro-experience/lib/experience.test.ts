import { normGroups } from "../api/norm";
import { expIssues } from "./validate";

const rec = (p: Record<string, unknown>) => ({ id: "r1", root_id: "root", version: 1, status: "approved", category_id: "c1", workplace: "Advokatlik byurosi", position: "Advokat", started_at: "2015-01-01T00:00:00Z", ended_at: null, description: "x", ...p });

describe("experience (TZ §13)", () => {
  it("reads the backend groups", () => {
    const g = normGroups({ groups: [{ root_id: "root", current: rec({}), pending_revision: rec({ id: "r2", version: 2, status: "pending_review" }), latest: rec({ id: "r2", version: 2, status: "pending_review" }), revision_count: 2 }] });
    expect(g).toHaveLength(1);
    expect(g[0].current?.status).toBe("approved");
    expect(g[0].pending?.id).toBe("r2");
    expect(g[0].current?.isCurrent).toBe(true);
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
  it("checks the form like the web does", () => {
    const base = { sourceId: "", categoryId: "c1", subcategoryId: "", workplace: "Byuro", position: "Advokat", startedOn: "2015-01-01", endedOn: "", isCurrent: true, description: "Jinoyat ishlari bo'yicha tergov va sud bosqichlarida himoya", stages: [], results: [], evidenceIds: [] };
    expect(expIssues(base, "2026-10-24")).toEqual([]);
    expect(expIssues({ ...base, categoryId: "", workplace: " ", startedOn: "2027-01-01" }, "2026-10-24")).toEqual(["category", "workplace", "started"]);
    expect(expIssues({ ...base, isCurrent: false, endedOn: "2014-01-01" }, "2026-10-24")).toEqual(["ended"]);
    expect(expIssues({ ...base, description: "qisqa" }, "2026-10-24")).toEqual(["description"]);
    expect(expIssues({ ...base, description: "Bog'laning: +998 90 123 45 67, tergov va sud bosqichlari" }, "2026-10-24")).toEqual(["contacts"]);
  });
});
