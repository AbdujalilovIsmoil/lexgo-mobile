import { asDict, asStr, type Dict } from "@/shared/lib/json";
import { normMessage } from "../api/normMessage";
import { normTicket } from "../api/normTicket";
import type { SupportMessage, SupportTicket } from "../model/types";

export type SupportEventKind = "created" | "claimed" | "transferred" | "closed" | "reopened" | "message" | "call" | "assist" | "updated";
export type SupportCall = { callId: string; roomId: string; callType: "audio" | "video"; status: string };

export type SupportEvent = {
  name: string; kind: SupportEventKind; ticketId: string; ticket: SupportTicket | null; messages: SupportMessage[];
  call: SupportCall | null; action: Dict | null; createdAt: string;
};

const KIND: Record<string, SupportEventKind> = {
  "support.ticket_created": "created", "support.ticket_claimed": "claimed", "support.ticket_transferred": "transferred",
  "support.ticket_transferred_to_you": "transferred", "support.ticket_closed": "closed", "support.ticket_reopened": "reopened",
  "support.ticket_message": "message", "support.call_created": "call",
};

function callOf(src: Dict): SupportCall | null {
  const m = asDict(src.message);
  const c = asDict(m.call ?? src.call);
  const callId = asStr(m.call_id ?? src.call_id ?? c.id);
  const roomId = asStr(m.room_id ?? src.room_id ?? c.room_id);
  return callId && roomId ? { callId, roomId, callType: asStr(c.call_type) === "video" ? "video" : "audio", status: asStr(c.status) } : null;
}

// A `support.*` frame of the user socket (also when wrapped in notification.created), or null.
export function supportEventOf(e: Dict): SupportEvent | null {
  let name = asStr(e.event);
  let src: Dict = e;
  if (name === "notification.created") {
    const n = asDict(e.notification);
    src = asDict(n.data ?? n.meta);
    name = asStr(src.event ?? n.kind);
  }
  if (!name.startsWith("support.")) return null;
  const raw = asDict(src.message);
  const parsed = src.ticket ? normTicket(src.ticket) : null;
  const ticket = parsed && parsed.id ? parsed : null;
  const ticketId = asStr(src.ticket_id) || ticket?.id || asStr(raw.ticket_id);
  if (!ticketId) return null;
  const kind: SupportEventKind = name.startsWith("support.assist_") ? "assist" : (KIND[name] ?? "updated");
  const hasMessage = (kind === "message" || kind === "created") && Boolean(raw.id || raw.content || raw.message);
  const message = hasMessage ? normMessage(raw, ticketId) : null;
  return {
    name, kind, ticketId, ticket, messages: message?.id ? [message] : [],
    call: kind === "call" ? callOf(src) : null,
    action: kind === "assist" ? asDict(src.action ?? raw.action) : null,
    createdAt: asStr(src.created_at ?? raw.created_at),
  };
}
