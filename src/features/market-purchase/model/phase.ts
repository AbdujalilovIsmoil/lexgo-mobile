import { orderPhase, type MarketOrder } from "@/entities/order";

// Where a purchase stands from the client's side.
export type PurchasePhase = "pending" | "paid" | "chat" | "completed" | "cancelled";

const DONE = new Set(["completed", "rated", "done", "closed"]);
const STOPPED = new Set(["cancelled", "canceled", "declined", "rejected", "lost", "refunded", "refund_pending", "expired"]);
const PAID = new Set(["paid", "held", "in_progress", "started"]);

// Before the order shows up in the list only the purchase answer's status is known. Only a status that really means "paid" reads as
// paid — an order still waiting for a specialist or for its payment is "received" (TZ §3: never "payment confirmed" on a guess).
export function phaseOfStatus(status: string): PurchasePhase {
  const s = status.trim().toLowerCase();
  if (STOPPED.has(s)) return "cancelled";
  if (DONE.has(s)) return "completed";
  return PAID.has(s) ? "paid" : "pending";
}

// Once the order is in the list its own flow decides (the same phases as the order screen): waiting, paid without a room yet, or with
// the chat open; the end, or a stop.
export function phaseOfOrder(o: MarketOrder): PurchasePhase {
  const p = orderPhase(o);
  if (p === "completed" || p === "rated") return "completed";
  if (p === "cancelled" || p === "refund" || p === "refunded") return "cancelled";
  if (p === "paid" || p === "reviewing" || p === "in_progress" || p === "rework") return o.canStartChat ? "chat" : "paid";
  return "pending";
}

export const PHASE_STEP: Record<PurchasePhase, number> = { pending: 1, paid: 2, chat: 2, completed: 3, cancelled: 1 };
