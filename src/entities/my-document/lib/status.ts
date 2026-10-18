// Backend document-request statuses, grouped for the client UI. Unknown ones fall to "draft"
// (claims nothing); the server flags (can_*, file.ready, rating.available) stay the truth.
export const READY = new Set(["file_ready", "rated"]);
export const DRAFT = new Set(["questionnaire", "draft", "ready_to_generate"]);
export const PAY_WAIT = new Set(["payment_pending", "payment_required", "awaiting_payment", "pending_payment"]);
export const REVIEW = new Set(["lawyer_review_requested", "open_pool", "claimed", "lawyer_review"]);
export const STOPPED = new Set(["payment_cancelled", "payment_rejected", "cancelled", "canceled", "rejected"]);

export type DocGroup = "draft" | "payment" | "review" | "ready" | "closed";

export function groupOf(status: string): DocGroup {
  const s = status.toLowerCase();
  if (READY.has(s)) return "ready";
  if (PAY_WAIT.has(s)) return "payment";
  if (REVIEW.has(s)) return "review";
  if (s === "closed" || STOPPED.has(s)) return "closed";
  return "draft";
}

export type Tone = "ok" | "warn" | "blue" | "err" | "gray";
const TONE: Record<DocGroup, Tone> = { draft: "warn", payment: "warn", review: "blue", ready: "ok", closed: "gray" };
export const toneOf = (status: string): Tone => (STOPPED.has(status.toLowerCase()) ? "err" : TONE[groupOf(status)]);

// Waiting for the client (fill in / pay) rather than for the platform.
export const needsClient = (status: string): boolean => ["draft", "payment"].includes(groupOf(status));
