import { asDict, asStr } from "@/shared/lib/json";

export const REVIEW_EVENTS = ["marketplace.experience_reviewed", "marketplace_experience_reviewed"];

// §3.13: the call center's decision reaches the seller as marketplace.experience_reviewed on the user socket, or as a notification of it.
export function isReviewEvent(e: { event: string } & Record<string, unknown>): boolean {
  if (REVIEW_EVENTS.includes(e.event)) return true;
  if (e.event !== "notification.created") return false;
  const n = asDict(e.notification ?? e); // the row itself, or the frame when it carries the row's fields
  return [asDict(n.data).event, asDict(n.metadata ?? n.meta).event, n.event, n.type].some((x) => REVIEW_EVENTS.includes(asStr(x)));
}
