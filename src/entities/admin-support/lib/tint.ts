import type { SupportTicket } from "../model/types";
import { isClosed, isUrgent, isWaiting } from "./tickets";

export const TINT = { ok: "#22C55E", warn: "#F59E0B", err: "#EF4444", blue: "#3B82F6", violet: "#8B5CF6", gray: "#8A99AC" };

// Colour strip of a ticket: urgent = red, waiting for an operator = amber, transferred = violet, being served = blue, finished = green / grey.
export function supportTint(tk: Pick<SupportTicket, "status" | "priority">): string {
  if (isClosed(tk.status)) return tk.status === "resolved" ? TINT.ok : TINT.gray;
  if (isUrgent(tk.priority)) return TINT.err;
  if (isWaiting(tk.status)) return TINT.warn;
  return tk.status === "transferred" ? TINT.violet : TINT.blue;
}
