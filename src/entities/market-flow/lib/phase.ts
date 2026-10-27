import type { FlowOrder, FlowPhase } from "../model/types";

const STOPPED = new Set(["cancelled", "canceled", "declined", "rejected", "lost", "expired"]);
const DONE = new Set(["completed", "rated", "done", "closed"]);
// The full payment of a new request is not confirmed yet (Enterprise contract §4: the order starts as pending_payment).
const PAYMENT_PENDING = new Set(["pending_payment", "payment_pending", "pending_confirmation", "waiting_payment"]);
// Handed to a seller who has not answered yet.
const SENT = new Set(["sent_to_seller", "assigned", "seller_assigned", "awaiting_acceptance", "pending_acceptance", "awaiting_seller", "waiting_seller_response"]);
const AWAITING = new Set([...SENT, "seller_selection", "new", "created", "pending"]);
// Accepted before a payment was confirmed: only orders of the old split-payment flow (there is no advance step any more).
const ACCEPTED = new Set(["accepted", "awaiting_advance", "advance_pending", "awaiting_payment"]);
const PAID = new Set(["paid", "held", "partially_paid", "advance_paid"]);
// The work is under way (the older statuses of the seller's own moves included).
const WORKING = new Set(["in_progress", "started", "result_ready", "quality_check", "delivered", "client_confirmation"]);

type O = { status: string; paymentStatus: string; flow: FlowOrder; rated?: boolean };

export const isPaidStatus = (paymentStatus: string): boolean => PAID.has(paymentStatus);

// Where the order stands, read from the backend status and flags only: endings first, then the call center's states, the seller's answer,
// the payment, the review stage and the work. A status the app does not know is shown neutrally (the call center has it) — never as "paid".
export function phaseOf(o: O): FlowPhase {
  const s = o.status;
  if (s === "refunded" || o.paymentStatus === "refunded") return "refunded";
  if (s === "refund_pending") return "refund";
  if (STOPPED.has(s)) return "cancelled";
  if (s === "rated" || (DONE.has(s) && o.rated)) return "rated";
  if (DONE.has(s)) return "completed";
  if (s === "cancellation_review") return "cancelReview";
  if (s === "resolution_required") return "resolution";
  // A paid order handed to another seller (TZ "Reassignment"): the client sees no seller and makes no payment until the new one accepts.
  if (o.flow.waitingReplacement) return "replacing";
  const paid = PAID.has(o.paymentStatus);
  // Enterprise contract §4: an order reaches a seller only once its full payment is confirmed, and the seller then has a window to answer.
  // (Before that contract a seller answered first; such an unpaid assignment reads as "received" below.)
  if (paid && (SENT.has(s) || o.flow.assignmentStatus === "waiting_seller_response" || (!!o.flow.acceptanceDeadlineAt && AWAITING.has(s)))) return "assigned";
  if (ACCEPTED.has(s) && !paid && o.flow.contactUnlocked !== true) return "advance";
  if (PAYMENT_PENDING.has(s) || (s === "pending" && !paid)) return "pending";
  if (o.flow.complaint.reworkRequired) return "rework";
  if (o.flow.workPhase === "reviewing") return "reviewing";
  if (WORKING.has(s) || !!o.flow.startedAt) return "in_progress";
  // TZ §3: before a specialist holds the order the client only sees that it was received — never "a lawyer is being searched".
  if (AWAITING.has(s) && !PAID.has(o.paymentStatus) && o.flow.contactUnlocked !== true) return "received";
  if (s === "paid" || ACCEPTED.has(s) || AWAITING.has(s)) return "paid";
  return "attention";
}

export const phaseFinished = (p: FlowPhase): boolean => p === "completed" || p === "rated";
export const phaseClosed = (p: FlowPhase): boolean => phaseFinished(p) || p === "cancelled" || p === "refund" || p === "refunded";
// The payment step is still ahead: no seller holds the order yet, no chat.
export const phaseBeforePayment = (p: FlowPhase): boolean => p === "received" || p === "advance" || p === "pending";

// The 4-step track under an order (request → payment → work → done): the step it is on, or -1 when it stopped (the badge says why).
export function phaseStep(p: FlowPhase): number {
  if (phaseFinished(p)) return 4;
  if (p === "cancelled" || p === "refund" || p === "refunded") return -1;
  return phaseBeforePayment(p) ? 1 : 2;
}

// Contact with the other side (TZ §6–§8): only once the backend unlocked it, and only while the order has a room. A finished order keeps
// its chat readable (read-only); so does an order being refunded or reassigned. Calls stop with them.
export type ChatMode = "open" | "readOnly" | "locked" | "none";
export function chatModeOf(o: { roomId: string; canStartChat: boolean; flow: FlowOrder }, phase: FlowPhase): ChatMode {
  // Paid but not accepted yet (assigned, or handed to another seller): the chat opens with the seller's acceptance (§4 step 7).
  if (!o.roomId) return phaseBeforePayment(phase) || phase === "assigned" || phase === "replacing" ? "locked" : "none";
  if (o.flow.contactUnlocked === false) return "locked";
  if (phaseClosed(phase) && phase !== "cancelled") return "readOnly";
  if (o.flow.chatReadOnly === true) return "readOnly";
  if (phase === "cancelled") return "none";
  return o.canStartChat ? "open" : "locked";
}

export function callTypesOf(o: { roomId: string; canCreateCall: boolean; flow: FlowOrder }, phase: FlowPhase): FlowOrder["callTypes"] {
  if (!o.roomId || !o.canCreateCall || o.flow.contactUnlocked === false || o.flow.callsEnabled === false || phaseClosed(phase)) return [];
  if (phase === "resolution" || phase === "replacing" || phase === "assigned") return [];
  return o.flow.callTypes;
}
