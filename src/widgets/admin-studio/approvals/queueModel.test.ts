import type { StudioDetail } from "@/entities/admin-studio";
import { needOf, versionDiff } from "./queueCore";

const v = (id: string, createdAt: string, payload: Record<string, unknown>) => ({ id, version: id, status: "published" as const, statusRaw: "", payload, summary: "", fileName: "", hasFile: false, createdAt, createdBy: "" });
const d = (p: Partial<StudioDetail>): StudioDetail => ({ id: "1", code: "K02", title: "", status: "submitted", statusRaw: "", currentVersionId: "b", currentVersion: "", publishedVersionId: "", assignedTo: "", createdBy: "", updatedAt: "", createdAt: "", hasFile: false, raw: {}, payload: {}, versions: [], steps: [], ...p }) as StudioDetail;

describe("approval queue", () => {
  it("an item waits for a decision, a publish or a fix", () => {
    expect(needOf(d({ status: "in_review" }))).toBe("review");
    expect(needOf(d({ status: "approved" }))).toBe("publish");
    expect(needOf(d({ status: "changes_requested" }))).toBe("returned");
    expect(needOf(d({ status: "published" }))).toBe("");
  });
  it("the diff is against the live version when there is one", () => {
    const x = versionDiff(d({ publishedVersionId: "a", versions: [v("a", "2026-01-01", { price: 1, name: "x" }), v("b", "2026-02-01", { price: 2, name: "x", note: "n" })] }));
    expect(x.base).toBe("live");
    expect(x.changes.map((c) => `${c.key}:${c.kind}`).sort()).toEqual(["note:added", "price:changed"]);
  });
  it("with nothing live it compares with the previous version, and a first version has no base", () => {
    expect(versionDiff(d({ versions: [v("a", "2026-01-01", { p: 1 }), v("b", "2026-02-01", { p: 2 })] })).base).toBe("previous");
    expect(versionDiff(d({ versions: [v("b", "2026-02-01", { p: 2 })] })).base).toBe("none");
  });
  it("equal versions give no changes", () => {
    expect(versionDiff(d({ publishedVersionId: "a", versions: [v("a", "2026-01-01", { p: 1 }), v("b", "2026-02-01", { p: 1 })] })).changes).toEqual([]);
  });
});
