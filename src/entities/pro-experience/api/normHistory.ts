import { asArr, asDict, asStr, type Dict } from "@/shared/lib/json";
import { byVersion, normRecord } from "./norm";
import type { ExpCheck, ExpHistory, ExpRecord, ExpReview } from "../model/types";

// The reviewer's checklist: a list of { key, verdict, note } (§3.11); a { key: verdict } map is read too.
function checklist(v: unknown): ExpCheck[] {
  const rows = Array.isArray(v) ? v : Object.entries(asDict(v)).map(([key, x]) => (typeof x === "string" ? { key, verdict: x } : { key, ...asDict(x) }));
  return rows.map((x) => {
    const d = asDict(x);
    return { key: asStr(d.key), verdict: asStr(d.verdict ?? d.status).toLowerCase(), note: asStr(d.note ?? d.comment) };
  }).filter((c) => c.key);
}

function normReview(v: unknown): ExpReview {
  const d = asDict(v);
  const decision = asStr(d.decision ?? d.status).toLowerCase();
  return {
    id: asStr(d.id),
    experienceId: asStr(d.experience_id ?? d.record_id),
    decision: decision === "approved" || decision === "rejected" ? decision : "other",
    reason: asStr(d.reason ?? d.rejection_reason),
    checklist: checklist(d.checklist),
    reviewedAt: asStr(d.reviewed_at ?? d.created_at),
  };
}

// A revision that carries its own decision (status, rejection_reason, checklist, reviewed_at) — for an answer without `reviews`.
function reviewOf(d: Dict): ExpReview | null {
  const s = asStr(d.status).toLowerCase();
  const decision = s === "rejected" ? "rejected" : s === "approved" || s.startsWith("superseded") ? "approved" : "";
  if (!decision || !asStr(d.reviewed_at)) return null;
  return normReview({ id: `${asStr(d.id)}:review`, experience_id: d.id, decision, reason: d.rejection_reason, checklist: d.checklist, reviewed_at: d.reviewed_at });
}

const at = (s: string) => Date.parse(s) || 0;

// GET /marketplace/me/experience/{id}/history (§3.8): the revisions oldest first, the decisions newest first.
export function normHistory(v: unknown): ExpHistory {
  const d = asDict(v);
  const raw = asArr(d.items ?? d.revisions).map(asDict);
  const revisions = raw.map(normRecord).filter((r): r is ExpRecord => !!r).sort(byVersion);
  const given = asArr(d.reviews).map(normReview);
  const reviews = given.length ? given : raw.map(reviewOf).filter((r): r is ExpReview => !!r);
  return { rootId: asStr(d.root_id) || revisions[0]?.rootId || "", revisions, reviews: reviews.sort((a, b) => at(b.reviewedAt) - at(a.reviewedAt)) };
}
