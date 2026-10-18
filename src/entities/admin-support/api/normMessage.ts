import { asArr, asDict, asStr, asNum } from "@/shared/lib/json";
import type { SupportMessage } from "../model/types";

const attachment = (a: unknown) => {
  const x = asDict(a);
  return { name: asStr(x.name ?? x.file_name ?? x.filename), url: asStr(x.url ?? x.download_url), size: asNum(x.size ?? x.size_bytes), mime: asStr(x.mime ?? x.content_type) };
};

// One chat message; the role is derived from the ticket's client when the API omits it.
export function normMessage(v: unknown, ticketId = "", clientUserId = ""): SupportMessage {
  const d = asDict(v);
  const p = asDict(d.payload);
  const sender = asDict(d.sender);
  const senderUserId = asStr(d.sender_user_id ?? p.sender_user_id ?? sender.id ?? d.owner_user_id);
  const messageType = asStr(d.message_type ?? p.message_type, "text");
  const derived = messageType === "system" ? "system" : clientUserId ? (senderUserId === clientUserId ? "client" : "operator") : "";
  const title = asStr(d.title).trim();
  const content = asStr(d.content ?? p.message ?? p.content ?? d.message ?? d.text) || (title && title !== "Support message" && !d.payload ? title : "");
  return {
    id: asStr(d.id ?? d.message_id),
    ticketId: asStr(d.ticket_id ?? p.ticket_id, ticketId),
    senderUserId,
    senderName: asStr(d.sender_name ?? p.sender_name).trim() || asStr(sender.name ?? sender.full_name).trim(),
    senderRole: asStr(d.sender_role ?? p.sender_role ?? sender.role) || derived,
    messageType,
    content,
    attachments: asArr(d.attachments ?? p.attachments).map(attachment),
    createdAt: asStr(d.created_at),
  };
}

export const isVisible = (m: SupportMessage) => Boolean(m.content.trim() || m.attachments.length || m.messageType === "system");
