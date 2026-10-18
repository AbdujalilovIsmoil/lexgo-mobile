import { ApiError, http } from "@/shared/api";
import { asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { MessagePage, SupportMessage } from "../model/types";
import { isVisible, normMessage } from "./normMessage";
import { normTicket } from "./normTicket";

const path = (id: string) => `/support/tickets/${encodeURIComponent(id)}/messages`;

// GET …/messages?order=desc — newest first; offset counts from the newest message.
export async function listMessages(id: string, p: { offset: number; limit: number }, clientUserId = ""): Promise<MessagePage> {
  const raw = await http(`${path(id)}?${new URLSearchParams({ order: "desc", limit: String(p.limit), offset: String(p.offset) })}`);
  const d = asDict(raw);
  const ticket = d.ticket ? normTicket(d.ticket) : null;
  const owner = clientUserId || ticket?.clientUserId || "";
  const list = listFrom(raw, "items", "data", "messages").map((v) => normMessage(v, id, owner));
  const total = asNum(d.total, p.offset + list.length);
  const more = typeof d.has_more === "boolean" ? d.has_more : p.offset + list.length < total;
  return { items: list.filter(isVisible), raw: list.length, total, hasMore: more && list.length > 0, ticket };
}

export async function sendMessage(id: string, content: string, clientUserId = ""): Promise<SupportMessage> {
  const text = content.trim();
  const d = asDict(await http(path(id), { method: "POST", body: { message: text, content: text, message_type: "text", attachments: [] } }));
  const wrapped = d.message && typeof d.message === "object" && !Array.isArray(d.message) ? d.message : null;
  return normMessage(wrapped ?? d, id, clientUserId);
}

// Contact details in a message are blocked by the backend (code platform_contact_blocked).
export function contactBlocked(e: unknown): string | null {
  if (!(e instanceof ApiError) || e.code !== "platform_contact_blocked") return null;
  return asStr(asDict(e.data.detail).message);
}
