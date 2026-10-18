import { createChat, limitFromError, localId, sendMessage } from "@/entities/chat";
import { isNetworkError } from "@/shared/api";
import { errorHaptic, tapHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { chatErrorText } from "./chatErrorText";
import { useChatStore } from "./chatStore";
import { recover } from "./recover";

// Async code reads the live store (never a stale render snapshot).
const live = () => useChatStore.getState();

async function ensureChat(clientId: string, seed: string, sid: number): Promise<string> {
  const have = live().chatId;
  if (have) return have;
  const chat = await createChat(clientId, seed.slice(0, 60));
  if (live().session === sid) useChatStore.setState({ chatId: chat.id });
  return chat.id;
}

async function onFailure(e: unknown, clientId: string, id: string, sid: number): Promise<void> {
  const limit = limitFromError(e);
  const chatId = live().chatId;
  if (isNetworkError(e) && chatId) {
    await recover(clientId, chatId, sid);
    if (live().session !== sid || !live().sending) return;
  }
  live().patch(id, { pending: false, failed: true });
  errorHaptic();
  if (limit && limit.kind !== "rate") {
    live().setLimitErr(limit);
    if (limit.guest) live().setLimit(limit.guest);
  } else toast(chatErrorText(e), "err");
}

// Send with an optimistic user bubble; the first message creates the chat. `retryId` re-sends a failed bubble.
export async function runSend(clientId: string, text: string, retryId?: string): Promise<void> {
  const content = text.trim();
  if (!content || live().sending) return;
  tapHaptic();
  const id = retryId ?? localId();
  if (retryId) live().patch(id, { pending: true, failed: false });
  else live().append({ id, role: "user", content, createdAt: new Date().toISOString(), pending: true });
  live().setSending(true);
  live().setLimitErr(null);
  const sid = live().session;
  try {
    const chatId = await ensureChat(clientId, content, sid);
    const res = await sendMessage(clientId, chatId, content);
    if (live().session !== sid) return;
    live().settle(id, res.user);
    live().upsert({ ...res.assistant, createdAt: res.assistant.createdAt ?? new Date().toISOString() });
    live().setLimit(res.limit ?? null);
  } catch (e) {
    if (live().session === sid) await onFailure(e, clientId, id, sid);
  } finally {
    if (live().session === sid) live().setSending(false);
  }
}
