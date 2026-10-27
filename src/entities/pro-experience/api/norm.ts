import { asArr, asDict, asNum, asStr, type Dict } from "@/shared/lib/json";
import type { ExpCategory, ExpEvidence, ExpGroup, ExpRecord, ExpStatus } from "../model/types";

const num = (v: unknown): number | null => (v === null || v === undefined || v === "" ? null : Number.isFinite(asNum(v, NaN)) ? asNum(v) : null);
export const strs = (v: unknown): string[] => asArr(v).map((x) => asStr(x)).filter(Boolean);

function statusOf(v: unknown): ExpStatus {
  const s = asStr(v).toLowerCase();
  if (s === "pending_review" || s === "pending") return "pending_review";
  if (s === "canceled") return "cancelled";
  if (s === "approved" || s === "rejected" || s === "cancelled") return s;
  return s.startsWith("superseded") ? "superseded" : "other";
}

// An uploaded file (POST …/evidence answers { id, file_name, mime_type, size, download_url }); a record may list bare ids instead.
export function evidence(v: unknown): ExpEvidence {
  const d = typeof v === "string" || typeof v === "number" ? { id: v } : asDict(v);
  const id = asStr(d.id ?? d.evidence_id);
  const url = asStr(d.download_url) || (id ? `/marketplace/experience/evidence/${encodeURIComponent(id)}` : "");
  return { id, fileName: asStr(d.file_name ?? d.name), mime: asStr(d.mime_type ?? d.content_type), size: asNum(d.size, 0), downloadUrl: url };
}

// `evidence` objects and/or `evidence_ids`: an edit sends every id again, so a file known only by its id must not get lost.
function evidenceOf(d: Dict): ExpEvidence[] {
  const out = new Map<string, ExpEvidence>();
  for (const e of [...asArr(d.evidence ?? d.evidence_files), ...asArr(d.evidence_ids)].map(evidence)) if (e.id && !out.has(e.id)) out.set(e.id, e);
  return [...out.values()];
}

export function normRecord(v: unknown): ExpRecord | null {
  const d = asDict(v);
  const id = asStr(d.id);
  if (!id) return null;
  const ended = asStr(d.ended_at);
  const status = statusOf(d.status);
  return {
    id,
    rootId: asStr(d.root_id) || id,
    version: num(d.version),
    status,
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
    evidence: evidenceOf(d),
    years: num(d.years),
    rejectionReason: asStr(d.rejection_reason ?? d.reason),
    submittedAt: asStr(d.submitted_at ?? d.created_at),
    affectsPricing: typeof d.affects_pricing === "boolean" ? d.affects_pricing : status === "approved",
  };
}

export const byVersion = (a: ExpRecord, b: ExpRecord) => (a.version ?? 0) - (b.version ?? 0) || a.submittedAt.localeCompare(b.submittedAt);
const newer = (a: ExpRecord | null, b: ExpRecord | null) => (!a ? b : !b ? a : byVersion(a, b) >= 0 ? a : b);

// One page of GET /marketplace/me/experience: `groups` (verified / under review / newest per entry) when the backend sends them, else the
// flat revisions grouped by their root.
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
  const roots = new Map<string, Map<string, ExpRecord>>();
  for (const r of (Array.isArray(v) ? v : asArr(d.items)).map(normRecord)) if (r) roots.set(r.rootId, (roots.get(r.rootId) ?? new Map()).set(r.id, r));
  return [...roots.entries()].map(([rootId, list]) => {
    const all = [...list.values()].sort(byVersion);
    return { rootId, current: all.filter((r) => r.status === "approved").pop() ?? null, pending: all.filter((r) => r.status === "pending_review").pop() ?? null, latest: all[all.length - 1] ?? null, revisionCount: all.length };
  });
}

// An entry may come back on more than one page: one per root, the newest of each kind, in the order the backend sent them.
function mergeGroups(list: ExpGroup[]): ExpGroup[] {
  const out = new Map<string, ExpGroup>();
  for (const g of list) {
    const was = out.get(g.rootId);
    out.set(g.rootId, was ? { rootId: g.rootId, current: newer(was.current, g.current), pending: newer(was.pending, g.pending), latest: newer(was.latest, g.latest), revisionCount: Math.max(was.revisionCount, g.revisionCount) } : g);
  }
  return [...out.values()];
}

// Every page read: the backend's groups merged, or (an answer without groups) all flat revisions grouped at once.
export function normPages(pages: unknown[]): ExpGroup[] {
  const ds = pages.map((p) => (Array.isArray(p) ? { items: p } : asDict(p)));
  if (ds.some((d) => asArr(d.groups).length)) return mergeGroups(ds.flatMap((d) => normGroups(d)));
  return normGroups({ items: ds.flatMap((d) => asArr(d.items)) });
}

// GET /service-categories/tree (TZ.md "Public category tree with real IDs"): the roots and their direct children — a child's id is what
// subcategory_id takes, deeper levels are not valid there. Inactive nodes are left out.
export function normTree(v: unknown): ExpCategory[] {
  const node = (x: unknown) => {
    const d = asDict(x);
    return { id: asStr(d.id), title: asStr(d.title ?? d.name), on: d.is_active !== false, kids: asArr(d.children ?? d.subcategories) };
  };
  const ok = (n: ReturnType<typeof node>) => !!(n.id && n.title && n.on);
  return asArr(Array.isArray(v) ? v : asDict(v).items).map(node).filter(ok).map((c) => ({ id: c.id, title: c.title, children: c.kids.map(node).filter(ok).map((y) => ({ id: y.id, title: y.title })) }));
}
