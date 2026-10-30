import { http } from "@/shared/api";
import { asDict, listFrom } from "@/shared/lib/json";
import { normChat, normContracts, normMessage, normSources } from "./normalize";
import { normLimit } from "./normalizeLimit";
import type { Chat, ChatMessage, GuestLimit } from "../model/types";

const base = (clientId: string) => `/clients/${clientId}/chats`;
const latest = (c: Chat) => Date.parse(c.updatedAt ?? "") || 0;

// Chat list, most recently active first (TZ 8). The server already orders it, but the order is enforced here.
export async function listChats(clientId: string): Promise<Chat[]> {
  const rows = listFrom(await http(base(clientId)), "chats", "items", "data").map(normChat);
  return rows.sort((a, b) => latest(b) - latest(a));
}

export async function createChat(clientId: string, title: string): Promise<Chat> {
  return normChat(await http(base(clientId), { method: "POST", body: { title } }));
}

// The server's final state of a chat: messages in order, top-level contracts on the last answer.
export async function getMessages(clientId: string, chatId: string): Promise<ChatMessage[]> {
  const data = await http(`${base(clientId)}/${chatId}`);
  const messages = listFrom(data, "messages", "items", "data").map(normMessage);
  const top = normContracts(asDict(data).contracts);
  const last = top.length ? [...messages].reverse().find((m) => m.role === "assistant") : undefined;
  if (last && !last.contracts?.length) last.contracts = top;
  return messages;
}

export type SendResult = { user?: ChatMessage; assistant: ChatMessage; limit?: GuestLimit };

export async function sendMessage(clientId: string, chatId: string, content: string, signal?: AbortSignal): Promise<SendResult> {
  const d = asDict(await http(`${base(clientId)}/${chatId}/messages`, { method: "POST", body: { content }, signal }));
  const assistant = normMessage(d.assistant_message ?? { role: "assistant", content: d.content });
  const sources = assistant.sources?.length ? assistant.sources : normSources(d.sources);
  const contracts = assistant.contracts?.length ? assistant.contracts : normContracts(d.contracts);
  return { user: d.user_message ? normMessage(d.user_message) : undefined, assistant: { ...assistant, sources, contracts }, limit: normLimit(d.limit_status) };
}

// "Useful / not useful" on an answer (POST /ai/feedback, same payload as the web).
export async function sendFeedback(messageId: string, useful: boolean, comment = ""): Promise<void> {
  await http("/ai/feedback", { method: "POST", body: { useful, comment, request_id: messageId } });
}
