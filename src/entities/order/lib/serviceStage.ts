import type { Order } from "../model/types";
import type { MarketStage } from "../model/marketTypes";

const STOPPED = new Set(["cancelled", "canceled", "declined", "rejected", "lost", "refunded"]);
const DONE = new Set(["completed", "rated", "closed", "done", "delivered", "client_confirmation"]);
const WORKING = new Set(["accepted", "started", "in_progress", "result_ready", "quality_check", "paid"]);

// A catalogue/service order (GET /orders) on the same four stages as a marketplace purchase.
export function serviceStageOf(o: Pick<Order, "status" | "paymentStatus">): MarketStage {
  if (STOPPED.has(o.status)) return "cancelled";
  if (DONE.has(o.status)) return "completed";
  return WORKING.has(o.status) || o.paymentStatus === "paid" ? "active" : "pending";
}
