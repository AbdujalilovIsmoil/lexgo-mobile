import type { MarketOrder } from "../model/marketTypes";
import { marketStageOf } from "./stage";

type O = Pick<MarketOrder, "status" | "paymentStatus" | "lawyerUserId" | "roomId" | "canStartChat">;

const PAID = new Set(["paid", "success", "succeeded", "completed", "approved", "partially_paid", "advance_paid"]);
const VOID = new Set(["refunded", "failed", "cancelled", "canceled", "expired", "rejected"]);

// A purchase that still entitles the client to talk to its specialist: paid (or already given a chat room) and in work.
// Pending payment, completed/closed and cancelled/declined/refunded orders no longer do.
export function orderGivesChat(o: O): boolean {
  if (marketStageOf(o) !== "active") return false;
  if (VOID.has(o.paymentStatus) || o.status === "refunded") return false;
  return PAID.has(o.paymentStatus) || o.canStartChat || !!o.roomId;
}

// The rule for the "Chat" entry on a specialist's page: only while the client holds a running paid order with that specialist.
export function canChatWith(specialistId: string, orders: readonly O[] | undefined): boolean {
  if (!specialistId || !orders) return false;
  return orders.some((o) => o.lawyerUserId === specialistId && orderGivesChat(o));
}
