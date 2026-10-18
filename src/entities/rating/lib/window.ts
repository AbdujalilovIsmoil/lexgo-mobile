import { asDict, asNum, asStr, type Dict } from "@/shared/lib/json";
import type { RatingWindow } from "../model/types";

// A urgent request nests the window as { deadline_at, available, remaining_seconds, submitted,
// closed_reason, value }; a document work carries the same object (or flat rating_* fields).
export function normWindow(nested: unknown, flat: Dict, fetchedAt: number): RatingWindow {
  const n = asDict(nested);
  const nestedForm = n.available !== undefined || n.submitted !== undefined || n.deadline_at !== undefined;
  const v = nestedForm ? n.value : flat.rating;
  const given = asDict(v);
  return {
    available: Boolean(nestedForm ? n.available : flat.rating_available),
    submitted: Boolean(nestedForm ? n.submitted : flat.rating_submitted),
    deadlineAt: asStr(nestedForm ? n.deadline_at : flat.rating_deadline_at),
    remainingSeconds: asNum(nestedForm ? n.remaining_seconds : flat.rating_remaining_seconds),
    closedReason: asStr(nestedForm ? n.closed_reason : flat.rating_closed_reason),
    stars: typeof v === "number" ? v : asNum(given.rating),
    comment: asStr(given.comment),
    fetchedAt,
  };
}

// Open for rating AND complaint: the backend's answer, nothing else.
export const windowOpen = (w: RatingWindow): boolean => w.available && !w.submitted;

// Milliseconds left on the server's own count (elapsed time on this phone only moves the count down).
export function msLeft(w: RatingWindow, now: number): number {
  if (w.remainingSeconds > 0) return Math.max(0, w.remainingSeconds * 1000 - (now - w.fetchedAt));
  const end = Date.parse(w.deadlineAt);
  return Number.isFinite(end) && windowOpen(w) ? Math.max(0, end - now) : 0;
}
