import type { StudioDetail, StudioPayload } from "@/entities/admin-studio";

export type Need = "review" | "publish" | "returned";
export const NEEDS: Need[] = ["review", "publish", "returned"];

// What an item waits for: a decision (submitted / in review), the publish, or the author's fix.
export function needOf(d: StudioDetail): Need | "" {
  if (d.status === "submitted" || d.status === "in_review") return "review";
  if (d.status === "approved") return "publish";
  if (d.status === "changes_requested") return "returned";
  return "";
}

// ---- what changed ----
export type Change = { key: string; kind: "added" | "removed" | "changed"; before: unknown; after: unknown };
export type Diff = { base: "live" | "previous" | "none"; changes: Change[] };
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const empty = (v: unknown) => v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length);

// The current version against what the site shows (the published version) or, with nothing published, the version before it.
export function versionDiff(d: StudioDetail): Diff {
  const cur = d.versions.find((v) => v.id === d.currentVersionId) ?? d.versions[0];
  if (!cur) return { base: "none", changes: [] };
  const live = d.versions.find((v) => v.id === d.publishedVersionId && v.id !== cur.id);
  const idx = d.versions.findIndex((v) => v.id === cur.id);
  const prev = live ?? d.versions.find((v, i) => i !== idx && Date.parse(v.createdAt) < Date.parse(cur.createdAt));
  const before: StudioPayload = prev?.payload ?? {};
  const after: StudioPayload = cur.payload ?? {};
  const changes: Change[] = [];
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const b = before[key];
    const a = after[key];
    if (same(a, b) || (empty(a) && empty(b))) continue;
    changes.push({ key, kind: empty(b) ? "added" : empty(a) ? "removed" : "changed", before: b, after: a });
  }
  return { base: live ? "live" : prev ? "previous" : "none", changes };
}
