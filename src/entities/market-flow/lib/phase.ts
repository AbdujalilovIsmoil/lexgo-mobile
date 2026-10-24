import type { FlowOrder, FlowPhase } from "../model/types";

const STOPPED = new Set(["cancelled", "canceled", "declined", "rejected", "lost", "refunded", "refund_pending", "expired"]);
const DONE = new Set(["completed", "rated", "done", "closed"]);
const LEGACY_PENDING = new Set(["pending_payment", "pending_confirmation", "waiting_payment"]);
// Sent to a seller who has not answered yet (the assignment of TZ §5).
const AWAITING = new Set(["sent_to_seller", "assigned", "seller_assigned", "awaiting_acceptance", "pending_acceptance", "awaiting_seller", "seller_selection", "new", "created", "pending"]);
// Accepted, before the 10% advance is confirmed.
const ACCEPTED = new Set(["accepted", "awaiting_advance", "advance_pending", "awaiting_payment"]);
const PAID = new Set(["paid", "held", "partially_paid", "advance_paid"]);

type O = { status: string; paymentStatus: string; flow: FlowOrder; rated?: boolean };

// Where the order stands, read from the backend status and flags only. Ends first, then the seller's answer, the advance, the work.
export function phaseOf(o: O): FlowPhase {
  const s = o.status;
  if (STOPPED.has(s)) return "cancelled";
  if (s === "rated" || (DONE.has(s) && o.rated)) return "rated";
  if (DONE.has(s)) return "completed";
  if (s === "cancellation_review") return "review";
  if (o.flow.acceptanceDeadlineAt && AWAITING.has(s)) return "assigned";
  if (ACCEPTED.has(s) && !PAID.has(o.paymentStatus) && o.flow.contactUnlocked !== true) return "advance";
  if (LEGACY_PENDING.has(s) || (s === "pending" && o.paymentStatus !== "paid")) return "pending";
  if (s === "in_progress" || s === "started" || !!o.flow.startedAt) return "in_progress";
  return "paid";
}

export const phaseFinished = (p: FlowPhase): boolean => p === "completed" || p === "rated";
export const phaseClosed = (p: FlowPhase): boolean => phaseFinished(p) || p === "cancelled";

// Contact with the other side (TZ §6–§8): only once the backend unlocked it, and only while the order has a room. A finished order keeps
// its chat readable (read-only); calls stop with it.
export type ChatMode = "open" | "readOnly" | "locked" | "none";
export function chatModeOf(o: { roomId: string; canStartChat: boolean; flow: FlowOrder }, phase: FlowPhase): ChatMode {
  if (!o.roomId) return phase === "advance" || phase === "assigned" || phase === "pending" ? "locked" : "none";
  if (o.flow.contactUnlocked === false) return "locked";
  if (phaseFinished(phase) || o.flow.chatReadOnly === true) return "readOnly";
  if (phase === "cancelled") return "none";
  return o.canStartChat ? "open" : "locked";
}

export function callTypesOf(o: { roomId: string; canCreateCall: boolean; flow: FlowOrder }, phase: FlowPhase): FlowOrder["callTypes"] {
  if (!o.roomId || !o.canCreateCall || o.flow.contactUnlocked === false || o.flow.callsEnabled === false || phaseClosed(phase)) return [];
  return o.flow.callTypes;
}
