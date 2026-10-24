import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { ExpEvidence, ExpGroup, ExpRecord, ExpStatus } from "../model/types";

const num = (v: unknown): number | null => (v === null || v === undefined || v === "" ? null : Number.isFinite(asNum(v, NaN)) ? asNum(v) : null);
export const strs = (v: unknown): string[] => asArr(v).map((x) => asStr(x)).filter(Boolean);

function statusOf(v: unknown): ExpStatus {
  const s = asStr(v).toLowerCase();
  if (s === "pending_review" || s === "pending") return "pending_review";
  if (s === "approved" || s === "rejected" || s === "cancelled") return s;
  return s.startsWith("superseded") ? "superseded" : "other";
}

export function evidence(v: unknown): ExpEvidence {
  const d = asDict(v);
  const id = asStr(d.id ?? d.evidence_id);
  return { id, fileName: asStr(d.file_name ?? d.name), downloadUrl: asStr(d.download_url) || (id ? `/marketplace/experience/evidence/${encodeURIComponent(id)}` : "") };
}

export function normRecord(v: unknown): ExpRecord | null {
  const d = asDict(v);
  const id = asStr(d.id);
  if (!id) return null;
  const ended = asStr(d.ended_at);
  return {
    id,
    rootId: asStr(d.root_id) || id,
    version: num(d.version),
    status: statusOf(d.status),
    categoryId: asStr(d.category_id),
    subcategoryId: asStr(d.subcategory_id),
    workplace: asStr(d.workplace),
    position: asStr(d.position),
    startedAt: asStr(d.started_at),
    endedAt: ended,
    isCurrent: d.is_current === true || (d.is_current === undefined && !ended),
    description: asStr(d.description),
    stages: strs(d.stages),
    results: strs(d.results),
    evidence: asArr(d.evidence ?? d.evidence_files).map(evidence).filter((e) => e.id),
    years: num(d.years),
    rejectionReason: asStr(d.rejection_reason ?? d.reason),
    submittedAt: asStr(d.submitted_at ?? d.created_at),
  };
}

const byVersion = (a: ExpRecord, b: ExpRecord) => (a.version ?? 0) - (b.version ?? 0) || a.submittedAt.localeCompare(b.submittedAt);

// GET /marketplace/me/experience: `groups` (verified / under review / newest per entry) when the backend sends them, else the flat
// revisions grouped by their root.
export function normGroups(v: unknown): ExpGroup[] {
  const d = asDict(v);
  const groups = asArr(d.groups);
  if (groups.length) {
    return groups.map((x) => {
      const g = asDict(x);
      const latest = normRecord(g.latest);
      return { rootId: asStr(g.root_id) || latest?.rootId || "", current: normRecord(g.current), pending: normRecord(g.pending_revision), latest, revisionCount: num(g.revision_count) ?? 1 };
    }).filter((g) => g.rootId || g.latest);
  }
  const roots = new Map<string, ExpRecord[]>();
  for (const r of (Array.isArray(v) ? v : asArr(d.items)).map(normRecord)) if (r) roots.set(r.rootId, [...(roots.get(r.rootId) ?? []), r]);
  return [...roots.entries()].map(([rootId, list]) => {
    const all = [...list].sort(byVersion);
    return { rootId, current: all.filter((r) => r.status === "approved").pop() ?? null, pending: all.filter((r) => r.status === "pending_review").pop() ?? null, latest: all[all.length - 1] ?? null, revisionCount: all.length };
  });
}

