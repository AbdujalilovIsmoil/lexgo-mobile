import type { WorkGroup } from "./types";

const SETS: Record<WorkGroup, string[]> = {
  queue: ["new", "draft", "pending", "submitted", "available", "open_pool", "questionnaire", "ready_to_generate", "pending_payment", "payment_pending", "payment_required", "awaiting_payment", "waiting_payment", "waiting_info", "waiting_docs", "seller_selection", "sent_to_seller"],
  review: ["in_review", "lawyer_review", "lawyer_review_requested", "under_review", "pending_review", "review", "quality_check", "result_ready", "delivered", "client_confirmation"],
  done: ["completed", "fulfilled", "done", "file_ready", "resolved", "rated", "closed"],
  closed: ["cancelled", "canceled", "rejected", "expired", "archived", "failed", "declined", "lost", "payment_rejected", "payment_cancelled"],
  active: [],
};

const GROUP_OF = new Map<string, WorkGroup>(Object.entries(SETS).flatMap(([g, list]) => list.map((s) => [s, g as WorkGroup] as const)));

// Backend flags are the truth; this only buckets a status for filters and colours.
// A status we do not know is shown as "active" (it claims nothing more than that).
export const workGroup = (status: string): WorkGroup => GROUP_OF.get(status.trim().toLowerCase()) ?? "active";

export const GROUPS: WorkGroup[] = ["queue", "active", "review", "done", "closed"];
export const OPEN_GROUPS: WorkGroup[] = ["queue", "active", "review"];
export const isOpenWork = (status: string): boolean => OPEN_GROUPS.includes(workGroup(status));

const BAD = new Set(["rejected", "declined", "failed", "payment_rejected", "lost"]);
// Pill tone of a status (warn = waiting for someone, blue = moving, ok = finished).
export function workTone(status: string): "warn" | "blue" | "cy" | "ok" | "gray" | "err" {
  const s = status.trim().toLowerCase();
  if (BAD.has(s)) return "err";
  const g = workGroup(s);
  return g === "queue" ? "warn" : g === "review" ? "cy" : g === "done" ? "ok" : g === "closed" ? "gray" : "blue";
}
