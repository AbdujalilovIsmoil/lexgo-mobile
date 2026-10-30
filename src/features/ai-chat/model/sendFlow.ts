import { createChat, limitFromError, localId, sendMessage } from "@/entities/chat";
import { isNetworkError } from "@/shared/api";
import { errorHaptic, tapHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { chatErrorText } from "./chatErrorText";
import { useChatStore } from "./chatStore";
import { recover } from "./recover";

// Async code reads the live store (never a stale render snapshot).
const live = () => useChatStore.getState();

// The question in flight, so the stop button can cancel it.
let inFlight: { abort: AbortController; id: string; sid: number } | null = null;

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
  live().setMuted(false);
  live().setLimitErr(null);
  const sid = live().session;
  const abort = new AbortController();
  inFlight = { abort, id, sid };
  try {
    const chatId = await ensureChat(clientId, content, sid);
    const res = await sendMessage(clientId, chatId, content, abort.signal);
    if (live().session !== sid || abort.signal.aborted) return;
    live().settle(id, res.user);
    live().upsert({ ...res.assistant, createdAt: res.assistant.createdAt ?? new Date().toISOString() });
    live().setLimit(res.limit ?? null);
  } catch (e) {
    if (live().session === sid && !abort.signal.aborted) await onFailure(e, clientId, id, sid);
  } finally {
    if (inFlight?.abort === abort) inFlight = null;
    if (live().session === sid && !abort.signal.aborted) live().setSending(false);
  }
}

// The stop button: cancel the question in flight. The question stays in the chat; its answer — should the server still finish it and
// push it over the socket — is not shown (it is in the chat's history on the server).
export function stopSend(): void {
  const f = inFlight;
  if (!f) return;
  inFlight = null;
  f.abort.abort();
  if (live().session !== f.sid) return;
  live().patch(f.id, { pending: false });
  live().setMuted(true);
  live().setSending(false);
}
