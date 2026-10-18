import { asDict, asNum, asStr } from "@/shared/lib/json";
import type { UrgentPayment, UrgentRating } from "../model/types";

// Urgent sends { rating: { deadline_at, available, submitted, value } }; older shapes spell it flat.
export function normRating(nested: unknown, flat: Record<string, unknown>): UrgentRating {
  const n = asDict(nested);
  const has = n.deadline_at !== undefined || n.available !== undefined || n.submitted !== undefined;
  const src = has ? n : { deadline_at: flat.rating_deadline_at, available: flat.rating_available, submitted: flat.rating_submitted, remaining_seconds: flat.rating_remaining_seconds, closed_reason: flat.rating_closed_reason, value: flat.rating };
  const v = src.value;
  return {
    deadlineAt: asStr(src.deadline_at),
    available: Boolean(src.available),
    submitted: Boolean(src.submitted),
    remainingSeconds: asNum(src.remaining_seconds),
    closedReason: asStr(src.closed_reason),
    value: typeof v === "number" ? v : asNum(asDict(v).rating),
  };
}

// A payment / Telegram approval step, when the record carries one. Absent → null (no step is invented).
export function normPayment(d: Record<string, unknown>, p: Record<string, unknown>): UrgentPayment | null {
  const pay = asDict(d.payment ?? p.payment);
  const status = asStr(pay.status ?? d.payment_status ?? p.payment_status);
  if (!status) return null;
  return { status, amount: asNum(pay.amount ?? p.price), provider: asStr(pay.provider ?? p.payment_provider) };
}
