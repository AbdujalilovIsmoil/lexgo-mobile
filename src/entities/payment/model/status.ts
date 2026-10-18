import type { PillTone } from "@/shared/ui";

export type PayPhase = "pending_confirmation" | "awaiting" | "paid" | "failed" | "cancelled" | "refunded";
export type PayGroup = "all" | "pending" | "paid" | "failed" | "refunded";

const PENDING = new Set(["pending", "payment_pending", "created", "processing", "unpaid", "waiting_payment"]);
const PAID = new Set(["paid", "held", "succeeded", "success"]);
const REFUNDED = new Set(["refunded", "partially_refunded"]);
const CANCELLED = new Set(["cancelled", "canceled", "rejected"]);

export const isPendingStatus = (status: string): boolean => PENDING.has(status.trim().toLowerCase());

// The backend status is the truth; this only decides how it is presented (TZ 27).
// `telegram_manual` payments wait for a person to approve them in Telegram.
export function phaseOf(p: { status: string; method: string }): PayPhase {
  const s = p.status.trim().toLowerCase();
  if (PENDING.has(s)) return p.method === "telegram_manual" ? "pending_confirmation" : "awaiting";
  if (PAID.has(s)) return "paid";
  if (REFUNDED.has(s)) return "refunded";
  return CANCELLED.has(s) ? "cancelled" : "failed";
}

export function groupOf(status: string): Exclude<PayGroup, "all"> {
  const s = status.trim().toLowerCase();
  return PENDING.has(s) ? "pending" : PAID.has(s) ? "paid" : REFUNDED.has(s) ? "refunded" : "failed";
}

export const PHASE_TONE: Record<PayPhase, PillTone> = {
  pending_confirmation: "warn",
  awaiting: "warn",
  paid: "ok",
  failed: "err",
  cancelled: "err",
  refunded: "gray",
};
