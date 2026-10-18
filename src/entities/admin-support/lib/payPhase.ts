import type { AssistContext, AssistDoc, PayGate, PayPhase } from "../model/assistTypes";
import type { DocResult, MarketResult, PlanCheckout, UrgentResult } from "../model/resultTypes";
import { payPhaseOf } from "../api/payGate";

const DOC_WAIT = new Set(["payment_required", "pending_payment", "payment_pending", "awaiting_payment", "waiting_payment"]);
const DOC_STOP = new Set(["payment_cancelled", "payment_canceled", "payment_rejected"]);
const ORDER_PAID = new Set(["paid", "accepted", "started", "in_progress", "completed", "done", "delivered", "closed"]);
const ORDER_WAIT = new Set(["pending_payment", "waiting_payment", "payment_pending", "awaiting_payment"]);
const ORDER_STOP = new Set(["cancelled", "canceled", "rejected", "refunded"]);
const final = (p: PayPhase) => p === "paid" || p === "rejected";

type DocLike = { status: string; poolStatus?: string; paid: boolean; paymentRequired: boolean; gate: PayGate | null };

export function docPayPhase(x: DocLike): PayPhase {
  const g = x.gate?.phase ?? "";
  if (final(g)) return g;
  const st = [x.status, x.poolStatus ?? ""].map((v) => v.toLowerCase());
  if (st.some((v) => DOC_STOP.has(v))) return "rejected";
  if (!x.gate && !x.paymentRequired && !st.some((v) => DOC_WAIT.has(v))) return "";
  return x.paid ? "paid" : "pending";
}

export function orderPayPhase(status: string, paymentStatus: string): PayPhase {
  const p = payPhaseOf(paymentStatus);
  if (p) return p;
  const s = status.toLowerCase();
  return ORDER_STOP.has(s) ? "rejected" : ORDER_PAID.has(s) ? "paid" : ORDER_WAIT.has(s) ? "pending" : "";
}

export const urgentPayPhase = (r: Pick<UrgentResult, "gate" | "paymentRequired">): PayPhase => r.gate?.phase || (r.paymentRequired ? "pending" : "");
export const marketPhase = (r: MarketResult): PayPhase => r.gate?.phase || orderPayPhase(r.orderStatus, r.paymentStatus) || payPhaseOf(r.status);

// Newest knowledge wins: the context (refetched while the panel is open) over the response of the action.
export function docPhaseNow(r: DocResult, doc: AssistDoc | undefined): PayPhase {
  const base = docPayPhase(r);
  if (!base || !doc) return base;
  return doc.paid ? "paid" : docPayPhase(doc);
}

export function marketPhaseNow(r: MarketResult, ctx: AssistContext): PayPhase {
  const order = ctx.orders.find((o) => (r.orderId && o.id === r.orderId) || (r.workId && o.workId === r.workId));
  return order ? orderPayPhase(order.status, order.paymentStatus) || marketPhase(r) : marketPhase(r);
}

// A plan checkout is "paid" once a new active subscription of that plan shows up and "pending" while the
// request is listed; when it vanished from the list without activating, the Telegram review is over.
export function planPhaseNow(c: PlanCheckout, subsBefore: string[], ctx: AssistContext, ctxAt: number, sentAt: number): { phase: PayPhase; reviewed: boolean } {
  if (c.planId && ctx.subs.some((s) => s.planId === c.planId && !subsBefore.includes(s.id))) return { phase: "paid", reviewed: false };
  if (ctx.pending.some((p) => (c.id && p.id === c.id) || (c.workId && p.workId === c.workId))) return { phase: "pending", reviewed: false };
  const base = payPhaseOf(c.status);
  const reviewed = base === "pending" && ctxAt > sentAt;
  return { phase: reviewed ? "" : base, reviewed };
}
