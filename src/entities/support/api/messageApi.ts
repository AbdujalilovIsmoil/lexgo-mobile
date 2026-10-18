import { ApiError, http } from "@/shared/api";
import { asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { MessagePage, SupportMessage } from "../model/types";
import { isVisible, normMessage } from "./normMessage";
import { normTicket } from "./normTicket";

const path = (id: string) => `/support/tickets/${encodeURIComponent(id)}/messages`;

// GET …/messages?order=desc|asc&limit&offset. Fetching marks the messages read for the caller.
export async function listMessages(id: string, p: { order: "asc" | "desc"; offset: number; limit: number }): Promise<MessagePage> {
  const raw = await http(`${path(id)}?${new URLSearchParams({ order: p.order, limit: String(p.limit), offset: String(p.offset) })}`);
  const d = asDict(raw);
  const list = listFrom(raw, "items", "data", "messages").map((v) => normMessage(v, id));
  const total = asNum(d.total, p.offset + list.length);
  const more = typeof d.has_more === "boolean" ? d.has_more : p.offset + list.length < total;
  return { items: list.filter(isVisible), raw: list.length, total, hasMore: more && list.length > 0, ticket: d.ticket ? normTicket(d.ticket) : null };
}

export async function sendMessage(id: string, content: string): Promise<SupportMessage> {
  const text = content.trim();
  const d = asDict(await http(path(id), { method: "POST", body: { message: text, content: text, message_type: "text", attachments: [] } }));
  const wrapped = d.message && typeof d.message === "object" && !Array.isArray(d.message) ? d.message : null;
  return normMessage(wrapped ?? d, id);
}

// Contact details / links in a message are refused (422 code platform_contact_blocked).
export function contactBlocked(e: unknown): string | null {
  if (!(e instanceof ApiError) || e.code !== "platform_contact_blocked") return null;
  return asStr(asDict(e.data.detail).message) || e.detail || "";
}
