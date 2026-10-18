import { getMessages, type ChatSocketEvent } from "@/entities/chat";
import { useChatStore } from "./chatStore";

const live = () => useChatStore.getState();

// A socket frame of the open chat → the store. Returns true when an assistant message arrived.
export function applyChatEvent(chatId: string, e: ChatSocketEvent): boolean {
  if (live().chatId !== chatId) return false;
  if (e.kind === "delta") {
    live().delta(e.id, e.text);
    return false;
  }
  live().upsert({ ...e.message, contracts: e.message.contracts?.length ? e.message.contracts : e.contracts });
  if (e.limit) live().setLimit(e.limit);
  return e.message.role === "assistant";
}

// After a reconnect / foreground: the server's final state wins (TZ 8, 37.6).
export async function reconcileChat(clientId: string, chatId: string): Promise<void> {
  try {
    const server = await getMessages(clientId, chatId);
    if (live().chatId === chatId) live().merge(server);
  } catch {
    /* the next reconnect retries */
  }
}
