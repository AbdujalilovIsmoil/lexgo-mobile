export const MKT_STATUSES = ["pending_payment", "paid", "completed", "cancelled"] as const;

export type MktTone = "pending" | "active" | "done" | "cancel" | "other";

export function toneOf(status: string): MktTone {
  if (status === "pending_payment" || status === "pending") return "pending";
  if (status === "paid" || status === "in_progress") return "active";
  if (status === "completed" || status === "approved") return "done";
  if (["cancelled", "rejected", "failed", "refunded", "expired"].includes(status)) return "cancel";
  return "other";
}

export const TONE_COLOR: Record<MktTone, string> = { pending: "#F59E0B", active: "#3B82F6", done: "#22C55E", cancel: "#EF4444", other: "#94A3B8" };
export const statusColor = (status: string): string => TONE_COLOR[toneOf(status)];
