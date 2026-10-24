import type { FlowOrder } from "@/entities/market-flow";
import type { OrderStage, ProOrder, StageTab } from "../model/types";
import { isPaused } from "./additional";

const STOPPED = new Set(["cancelled", "canceled", "declined", "rejected", "lost", "refunded"]);
const DONE = new Set(["completed", "rated", "done", "closed"]);
const WAITING = new Set(["pending_payment", "waiting_payment", "pending", "new", "seller_selection"]);
const FRESH = new Set(["paid", "sent_to_seller"]);

const AWAITING = new Set(["sent_to_seller", "assigned", "seller_assigned", "awaiting_acceptance", "pending_acceptance", "awaiting_seller", "seller_selection", "new", "created", "pending"]);
const ACCEPTED = new Set(["accepted", "awaiting_advance", "advance_pending", "awaiting_payment"]);

// Unpaid orders never reach a seller's queue (TZ 18) — if a waiting one slips through it is hidden. Two exceptions of TZ.md: an
// assignment waiting for this seller's answer (it has an acceptance deadline) is new, and an accepted order waiting for the client's
// advance is active (the seller already holds it).
export function stageOf(o: Pick<ProOrder, "status" | "paymentStatus" | "additional"> & { flow?: FlowOrder }): OrderStage {
  if (STOPPED.has(o.status)) return "cancelled";
  if (DONE.has(o.status)) return "completed";
  if (isPaused(o)) return "active"; // paid, paused for a supplemental payment (TZ 11)
  if (o.flow?.acceptanceDeadlineAt && AWAITING.has(o.status)) return "new";
  if (ACCEPTED.has(o.status) && o.paymentStatus !== "paid") return "active";
  if (WAITING.has(o.status) || (o.paymentStatus !== "paid" && o.paymentStatus !== "held")) return "unpaid";
  return FRESH.has(o.status) ? "new" : "active";
}

export const TABS: StageTab[] = ["all", "new", "active", "completed", "cancelled"];

export function countStages(list: ProOrder[]): Record<StageTab, number> {
  const c: Record<StageTab, number> = { all: 0, new: 0, active: 0, completed: 0, cancelled: 0 };
  for (const o of list) {
    const s = stageOf(o);
    if (s !== "unpaid") {
      c.all += 1;
      c[s] += 1;
    }
  }
  return c;
}

export const forSeller = (list: ProOrder[]): ProOrder[] => list.filter((o) => stageOf(o) !== "unpaid");
