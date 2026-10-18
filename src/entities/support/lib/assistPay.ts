import { asDict, asStr, type Dict } from "@/shared/lib/json";
import type { AssistPay } from "../model/assistTypes";

const STOP = new Set(["rejected", "declined", "cancelled", "canceled", "payment_cancelled", "payment_rejected", "failed", "expired", "refunded"]);
const PAID = new Set(["paid", "approved", "confirmed", "succeeded", "success", "captured", "pool_created", "activated", "active", "open_pool", "lawyer_review_requested", "claimed", "lawyer_review", "in_progress", "review", "completed"]);
const WAIT = new Set(["pending", "required", "pending_payment", "payment_pending", "payment_required", "waiting_payment", "awaiting_payment", "awaiting_approval", "pending_approval", "telegram_pending", "admin_telegram_confirm_required"]);

export const gateOf = (...sources: Dict[]): Dict => sources.map((s) => asDict(s.payment_gate)).find((g) => Object.keys(g).length) ?? {};

const words = (list: unknown[]) => list.map((s) => asStr(s).trim().toLowerCase()).filter(Boolean);

// Strongest signal first: a stop word, the gate's own verdict, anything still waiting, then "settled" words
// (a request already in the lawyers' pool is paid, but only when nothing says the payment is still open).
export function payPhase(statuses: unknown[], required: boolean, gateStatus: unknown): AssistPay {
  const w = words(statuses);
  const g = words([gateStatus])[0] ?? "";
  if (STOP.has(g) || w.some((x) => STOP.has(x))) return "rejected";
  if (PAID.has(g)) return "approved";
  if (required || WAIT.has(g) || w.some((x) => WAIT.has(x))) return "pending";
  return w.some((x) => PAID.has(x)) ? "approved" : "";
}
