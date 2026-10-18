import type { MarketOrder, MarketStage } from "../model/marketTypes";

export const MARKET_DONE = new Set(["completed", "rated", "done", "closed"]);
export const MARKET_STOPPED = new Set(["cancelled", "canceled", "declined", "rejected", "lost", "refunded"]);

type S = Pick<MarketOrder, "status" | "paymentStatus">;

// Still waiting for the payment approval (Telegram inline button).
export const isOrderPending = (o: S): boolean =>
  o.status === "pending_payment" || o.status === "pending_confirmation" || o.status === "waiting_payment" || (o.status === "pending" && o.paymentStatus !== "paid");

export function marketStageOf(o: S): MarketStage {
  if (MARKET_STOPPED.has(o.status)) return "cancelled";
  if (MARKET_DONE.has(o.status)) return "completed";
  return isOrderPending(o) ? "pending" : "active";
}

// Current step of the 4-step track (0 request, 1 payment, 2 work, 3 done); 4 = all done, -1 = stopped.
export const STAGE_STEP: Record<MarketStage, number> = { pending: 1, active: 2, completed: 4, cancelled: -1 };
