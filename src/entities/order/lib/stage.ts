import { phaseOf, type FlowPhase } from "@/entities/market-flow";
import type { MarketOrder, MarketStage } from "../model/marketTypes";

export const MARKET_DONE = new Set(["completed", "rated", "done", "closed"]);
export const MARKET_STOPPED = new Set(["cancelled", "canceled", "declined", "rejected", "lost", "refunded"]);
// Before a seller holds the order and the advance is paid (TZ §3–§6): the order waits, it is not "in work".
const BEFORE_PAYMENT = new Set(["seller_selection", "sent_to_seller", "new", "created", "assigned", "awaiting_acceptance", "pending_acceptance", "accepted", "awaiting_advance", "advance_pending", "awaiting_payment"]);
const PAID = new Set(["paid", "held", "partially_paid", "advance_paid"]);

type S = Pick<MarketOrder, "status" | "paymentStatus">;

// Still waiting for the payment approval (Telegram inline button).
export const isOrderPending = (o: S): boolean =>
  o.status === "pending_payment" || o.status === "pending_confirmation" || o.status === "waiting_payment" || (o.status === "pending" && o.paymentStatus !== "paid");

// The list's four groups. A refund (pending or done) ends the order for the client; an order a seller has not taken and paid for yet waits.
export function marketStageOf(o: S): MarketStage {
  if (MARKET_STOPPED.has(o.status) || o.status === "refund_pending" || o.paymentStatus === "refunded") return "cancelled";
  if (MARKET_DONE.has(o.status)) return "completed";
  if (isOrderPending(o) || (BEFORE_PAYMENT.has(o.status) && !PAID.has(o.paymentStatus))) return "pending";
  return "active";
}

// Where the order stands in the flow (the badge, the track and the lead read it).
export const orderPhase = (o: MarketOrder): FlowPhase => phaseOf({ status: o.status, paymentStatus: o.paymentStatus, flow: o.flow, rated: o.ratingStars > 0 });
