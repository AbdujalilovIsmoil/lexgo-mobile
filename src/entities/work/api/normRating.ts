import { asDict, asNum, asStr, type Dict } from "@/shared/lib/json";
import type { WorkRating } from "../model/detailTypes";

const NESTED = ["available", "submitted", "deadline_at"];
const FLAT = ["rating_available", "rating_submitted", "rating_deadline_at"];

// The server owns the window (TZ 25): urgent works nest it under `rating`,
// document works repeat the same facts flat on the document.
export function normRating(nested: unknown, flat: Dict = {}): WorkRating | null {
  const n = asDict(nested);
  const useNested = NESTED.some((k) => n[k] !== undefined);
  if (!useNested && !FLAT.some((k) => flat[k] !== undefined)) return null;
  const get = (k: string): unknown => (useNested ? n[k] : flat[`rating_${k}`]);
  const value = useNested ? n.value : flat.rating;
  const v = asDict(value);
  return {
    available: Boolean(get("available")),
    submitted: Boolean(get("submitted")),
    deadlineAt: asStr(get("deadline_at")),
    remainingSeconds: asNum(get("remaining_seconds")),
    closedReason: asStr(get("closed_reason")),
    stars: typeof value === "number" ? value : asNum(v.rating),
    comment: asStr(v.comment),
    ratedAt: asStr(v.rated_at),
  };
}
