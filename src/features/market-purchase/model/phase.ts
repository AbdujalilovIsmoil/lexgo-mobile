import { marketStageOf, type MarketOrder } from "@/entities/order";

// Where a purchase stands from the client's side.
export type PurchasePhase = "pending" | "paid" | "chat" | "completed" | "cancelled";

const DONE = new Set(["completed", "rated", "done", "closed"]);
const STOPPED = new Set(["cancelled", "canceled", "declined", "rejected", "lost", "refunded"]);

// Before the order shows up in the list only the purchase answer's status is known.
export function phaseOfStatus(status: string): PurchasePhase {
  const s = status.trim().toLowerCase();
  if (STOPPED.has(s)) return "cancelled";
  if (DONE.has(s)) return "completed";
  return !s || s === "pending" || s === "pending_payment" || s === "pending_confirmation" || s === "waiting_payment" ? "pending" : "paid";
}

// Once the order is in the list its flags decide: paid without a room yet, or with the chat open.
export function phaseOfOrder(o: MarketOrder): PurchasePhase {
  const stage = marketStageOf(o);
  return stage === "active" ? (o.canStartChat ? "chat" : "paid") : stage;
}

export const PHASE_STEP: Record<PurchasePhase, number> = { pending: 1, paid: 2, chat: 2, completed: 3, cancelled: 1 };
