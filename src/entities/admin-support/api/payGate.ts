import { uzs, type Dict } from "@/shared/lib/json";
import type { PayGate, PayPhase } from "../model/assistTypes";
import { currencyOf, dictOf, filled, flag, text } from "./dict";

const PAID = new Set(["paid", "approved", "confirmed", "succeeded", "success", "captured", "pool_created", "activated"]);
const WAIT = new Set(["pending", "pending_payment", "payment_pending", "payment_required", "waiting_payment", "awaiting_payment", "awaiting_approval", "pending_approval", "telegram_pending", "admin_telegram_confirm_required"]);
const STOP = new Set(["rejected", "declined", "cancelled", "canceled", "payment_cancelled", "payment_canceled", "payment_rejected", "failed", "expired", "refunded", "invalid"]);

// First status that says something about the payment.
export function payPhaseOf(...statuses: unknown[]): PayPhase {
  for (const s of statuses) {
    const v = text(s).toLowerCase();
    if (!v) continue;
    if (STOP.has(v)) return "rejected";
    if (PAID.has(v)) return "paid";
    if (WAIT.has(v)) return "pending";
  }
  return "";
}

const final = (p: PayPhase) => p === "paid" || p === "rejected";
export const pickPayPhase = (...phases: PayPhase[]): PayPhase => phases.find(final) ?? (phases.includes("pending") ? "pending" : "");

// `payment_gate` of the first source that has one.
export function normPayGate(...sources: Dict[]): PayGate | null {
  for (const src of sources) {
    const g = dictOf(src.payment_gate);
    if (!filled(g)) continue;
    const status = text(g.status);
    return { phase: payPhaseOf(status) || (flag(g.required) === true ? "pending" : ""), status, amount: uzs(g, "amount"), currency: currencyOf(g.currency), telegramSent: flag(g.telegram_sent) };
  }
  return null;
}

export const payRequired = (...sources: Dict[]) => sources.some((s) => flag(s.payment_required) === true);
