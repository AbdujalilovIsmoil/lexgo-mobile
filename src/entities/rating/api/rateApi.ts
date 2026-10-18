import { ApiError, http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import type { QualityComplaintRef, RateTarget } from "../model/types";

function ref(v: unknown): QualityComplaintRef | null {
  const d = asDict(v);
  return asStr(d.id) || asStr(d.work_id) ? { id: asStr(d.id), workId: asStr(d.work_id), status: asStr(d.status, "new") } : null;
}

// Rating a document or an urgent request goes to its own endpoint; a rating of 1–2 stars makes the
// backend open a quality complaint (carrying `complaint`) and name it in the answer. A marketplace
// order uses the generic POST /reviews.
export async function submitRating(t: RateTarget, stars: number, comment: string, complaint: string): Promise<QualityComplaintRef | null> {
  if (t.kind === "review") {
    await http("/reviews", { method: "POST", body: { lawyer_user_id: t.lawyerUserId || undefined, case_id: t.recordId || undefined, rating: stars, comment } });
    return null;
  }
  if (t.kind === "market" && t.ratingUrl) {
    await http(t.ratingUrl, { method: "POST", body: { rating: stars, comment: (complaint.trim() || comment).trim() } });
    return null;
  }
  const path = t.kind === "urgent" ? `/urgent-advokat/requests/${encodeURIComponent(t.recordId)}/rating` : `/document-requests/${encodeURIComponent(t.recordId)}/rating`;
  const body = { rating: stars, comment, ...(complaint.trim() ? { complaint: complaint.trim() } : {}) };
  return ref(asDict(await http(path, { method: "POST", body })).quality_complaint);
}

// 409 rating_window_closed (expired / already used / not opened): a state to show, not a failure.
export function isRatingClosed(e: unknown): boolean {
  return e instanceof ApiError && (e.code === "rating_window_closed" || (e.status === 409 && (!e.code || /rating_window_closed|already|expired/i.test(e.code))));
}
