import { asDict, asStr } from "@/shared/lib/json";
import { normTicket } from "../api/normTicket";
import type { SupportTicket } from "../model/types";

export type SupportLiveEvent = { name: string; ticketId: string; ticket: SupportTicket | null; senderUserId: string };

// A `support.*` event of the user socket (also when wrapped in notification.created), or null.
export function supportEventOf(e: Record<string, unknown>): SupportLiveEvent | null {
  let name = asStr(e.event);
  let src: Record<string, unknown> = e;
  if (name === "notification.created") {
    const n = asDict(e.notification);
    src = asDict(n.data ?? n.meta);
    name = asStr(src.event ?? n.kind);
  }
  if (!name.startsWith("support.")) return null;
  const parsed = src.ticket ? normTicket(src.ticket) : null;
  const ticket = parsed && parsed.id ? parsed : null;
  const msg = asDict(src.message);
  const ticketId = asStr(src.ticket_id) || ticket?.id || asStr(msg.ticket_id);
  return ticketId ? { name, ticketId, ticket, senderUserId: asStr(src.sender_user_id ?? msg.sender_user_id) } : null;
}
