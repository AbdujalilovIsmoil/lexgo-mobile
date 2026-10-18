import type { DocRequestState } from "../model/types";

// Where a handed-over review stands. Until Telegram approves the fee ("wait") the
// request is NOT with any advocate; "sent" means it reached the duty-advocate pool.
export type Phase = "wait" | "stopped" | "sent";

const STOPPED = new Set(["payment_cancelled", "payment_rejected"]);
const WAIT = new Set(["payment_required", "pending_payment"]);

export function phaseOf(r: Pick<DocRequestState, "status" | "paymentRequired" | "gate">): Phase {
  const s = r.status.toLowerCase();
  if (STOPPED.has(s) || r.gate?.status === "rejected" || r.gate?.status === "cancelled") return "stopped";
  if (WAIT.has(s) || (s === "awaiting_payment" && r.paymentRequired)) return "wait";
  return "sent";
}
