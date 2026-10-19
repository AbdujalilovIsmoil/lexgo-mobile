import type { MarketOrder } from "../model/marketTypes";
import { marketStageOf } from "./stage";

type O = Pick<MarketOrder, "status" | "paymentStatus" | "lawyerUserId" | "roomId" | "canStartChat">;

const VOID = new Set(["refunded", "failed", "cancelled", "canceled", "expired", "rejected"]);

// The web's rule (marketplace trackPhaseOf → "chat"): an order gives a chat only while it is in work — paid, not finished,
// not cancelled — AND the backend opened its chat (can_start_chat with a room; the normalizer requires both). Pending
// payment, a finished order (completed / rated / done / closed: the service is used up, its chat turns read-only) and a
// cancelled / declined / refunded one give none.
export function orderGivesChat(o: O): boolean {
  return marketStageOf(o) === "active" && o.canStartChat && !VOID.has(o.paymentStatus);
}

// The rule for the "Chat" entry on a specialist's page: only while the client holds such an order with that specialist.
export function canChatWith(specialistId: string, orders: readonly O[] | undefined): boolean {
  return chatRoomWith(specialistId, orders) !== "";
}

// The chat room of that order ("" when there is none): the page opens this room directly, like the web's order chat.
export function chatRoomWith(specialistId: string, orders: readonly O[] | undefined): string {
  if (!specialistId || !orders) return "";
  return orders.find((o) => o.lawyerUserId === specialistId && orderGivesChat(o))?.roomId ?? "";
}
