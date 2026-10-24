import { getMessages, type ChatSocketEvent } from "@/entities/chat";
import { useChatStore } from "./chatStore";

const live = () => useChatStore.getState();

// Tokens arrive far faster than the screen can use them; each store write re-renders the list, so they are
// gathered and written together about every 80 ms (and before any other event of the chat, to keep the order).
const FLUSH_MS = 80;
let pending: Record<string, string> = {};
let timer: ReturnType<typeof setTimeout> | null = null;
export function flushDeltas(): void {
  if (timer) clearTimeout(timer);
  timer = null;
  const batch = pending;
  pending = {};
  for (const id of Object.keys(batch)) live().delta(id, batch[id]);
}

// A socket frame of the open chat → the store. Returns true when an assistant message arrived.
export function applyChatEvent(chatId: string, e: ChatSocketEvent): boolean {
  if (live().chatId !== chatId) return false;
  if (e.kind === "delta") {
    pending[e.id] = (pending[e.id] ?? "") + e.text;
    timer ??= setTimeout(flushDeltas, FLUSH_MS);
    return false;
  }
  flushDeltas();
  live().upsert({ ...e.message, contracts: e.message.contracts?.length ? e.message.contracts : e.contracts });
  if (e.limit) live().setLimit(e.limit);
  return e.message.role === "assistant";
}

// After a reconnect / foreground: the server's final state wins (TZ 8, 37.6).
export async function reconcileChat(clientId: string, chatId: string): Promise<void> {
  try {
    const server = await getMessages(clientId, chatId);
    flushDeltas();
    if (live().chatId === chatId) live().merge(server);
  } catch {
    /* the next reconnect retries */
  }
}
