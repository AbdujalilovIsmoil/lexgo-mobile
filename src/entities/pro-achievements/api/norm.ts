import { asArr, asDict, asNum, asStr, type Dict } from "@/shared/lib/json";
import type { AchEvidence, AchPage, AchRecord, AchStatus, PublicAch } from "../model/types";

function statusOf(v: unknown): AchStatus {
  const s = asStr(v).toLowerCase();
  if (s === "pending_review" || s === "pending") return "pending_review";
  return s === "approved" || s === "rejected" ? s : "other";
}

// An uploaded file (POST …/achievements/evidence answers { id, file_name, mime_type, size, download_url }); a record may list bare ids.
// Without a download_url the file is read through the shared evidence route, as the experience files are.
export function normEvidence(v: unknown): AchEvidence {
  const d = typeof v === "string" || typeof v === "number" ? { id: v } : asDict(v);
  const id = asStr(d.id ?? d.evidence_id);
  const url = asStr(d.download_url) || (id ? `/marketplace/experience/evidence/${encodeURIComponent(id)}` : "");
  return { id, fileName: asStr(d.file_name ?? d.name), mime: asStr(d.mime_type ?? d.content_type), size: asNum(d.size, 0), downloadUrl: url };
}

// The category's name when the row carries it (`category_name`, or a `category` object / string).
function categoryName(d: Dict): string {
  const c = d.category;
  return asStr(d.category_name ?? d.category_title) || (typeof c === "string" ? c : asStr(asDict(c).title ?? asDict(c).name));
}

// `evidence` objects and/or `evidence_ids`, each file once.
function evidenceOf(d: Dict): AchEvidence[] {
  const out = new Map<string, AchEvidence>();
  for (const e of [...asArr(d.evidence ?? d.evidence_files), ...asArr(d.evidence_ids)].map(normEvidence)) if (e.id && !out.has(e.id)) out.set(e.id, e);
  return [...out.values()];
}

export function normAchievement(v: unknown): AchRecord | null {
  const d = asDict(v);
  const id = asStr(d.id);
  if (!id) return null;
  return {
    id,
    type: asStr(d.achievement_type ?? d.type),
    title: asStr(d.title).trim(),
    categoryId: asStr(d.category_id),
    categoryName: categoryName(d),
    achievedAt: asStr(d.achieved_at).slice(0, 10),
    description: asStr(d.description),
    status: statusOf(d.status),
    rejectionReason: asStr(d.rejection_reason ?? d.reason),
    submittedAt: asStr(d.submitted_at ?? d.created_at),
    evidence: evidenceOf(d),
  };
}

// Public rows: only the safe fields are read, so nothing private can reach a screen even if the backend adds it.
export function normPublic(v: unknown, i: number): PublicAch | null {
  const d = asDict(v);
  const title = asStr(d.title).trim();
  if (!title) return null;
  return { key: asStr(d.id) || `p${i}`, type: asStr(d.achievement_type ?? d.type), title, achievedAt: asStr(d.achieved_at).slice(0, 10), categoryName: categoryName(d) };
}

// One page ({items, total, count, limit, offset}); `next` is the offset of the following page, null at the end. A missing total falls
// back to has_more, then to "a full page came back".
export function normPage<T>(raw: unknown, offset: number, limit: number, row: (x: unknown, i: number) => T | null): AchPage<T> {
  const d = Array.isArray(raw) ? { items: raw } : asDict(raw);
  const rows = asArr(d.items);
  const items = rows.map(row).filter((x): x is T => x !== null);
  const total = asNum(d.total, offset + items.length);
  const more = d.has_more === true || (d.total !== undefined ? offset + rows.length < total : rows.length >= limit);
  return { items, total, next: more && rows.length > 0 ? offset + rows.length : null };
}
