import type { ReqKind } from "../model/types";

const DOC_FINAL = ["completed", "fulfilled", "cancelled", "canceled", "rejected", "expired", "done", "pending_payment"];
const URGENT_FINAL = ["completed", "cancelled", "canceled", "expired"];
const ORDER_FINAL = ["completed", "rated", "cancelled", "canceled", "declined", "refunded", "lost", "expired", "pending_payment"];

export const FINAL: Record<ReqKind, string[]> = { docs: DOC_FINAL, pool: DOC_FINAL, urgent: URGENT_FINAL, orders: ORDER_FINAL, meetings: ["ended", "cancelled", "canceled", "expired", "missed"] };

export const isActiveStatus = (kind: ReqKind, status: string): boolean => !FINAL[kind].includes(status);

// Waiting for the professional: an unclaimed pool item, an order to accept, a ringing / running session.
const ACTION: Record<ReqKind, string[]> = {
  docs: ["claimed", "new", "open_pool"],
  pool: ["open_pool"],
  urgent: ["open_pool", "claimed", "scheduled", "meeting_active", "in_progress"],
  orders: ["new", "paid", "sent_to_seller", "waiting_seller"],
  meetings: ["active", "scheduled"],
};
export const needsAction = (kind: ReqKind, status: string): boolean => ACTION[kind].includes(status);

export const REQ_KINDS: ReqKind[] = ["docs", "urgent", "orders", "meetings", "pool"];
