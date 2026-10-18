import type { QueryClient } from "@tanstack/react-query";
import { listMessages } from "../api/messageApi";
import { serverMs } from "../lib/time";
import { supKeys } from "./keys";
import type { ChatCache, SupportMessage } from "./types";

export const CHAT_PAGE = 40;

const newestFirst = (a: SupportMessage, b: SupportMessage) => serverMs(b.createdAt) - serverMs(a.createdAt) || (a.id < b.id ? 1 : -1);

/** Messages deduplicated by id, newest first. */
export function mergeChat(...lists: SupportMessage[][]): SupportMessage[] {
  const by = new Map<string, SupportMessage>();
  for (const m of lists.flat()) if (m.id) by.set(m.id, m);
  return [...by.values()].sort(newestFirst);
}

// Newest page, merged into what is already held. Offsets from the newest message shift as new
// ones arrive, so older pages are read oldest-first (`older` counts messages before the oldest held).
export async function loadChat(qc: QueryClient, id: string): Promise<ChatCache> {
  const prev = qc.getQueryData<ChatCache>(supKeys.chat(id));
  const page = await listMessages(id, { order: "desc", offset: 0, limit: CHAT_PAGE });
  void qc.invalidateQueries({ queryKey: supKeys.lists }); // reading marks the ticket read
  void qc.invalidateQueries({ queryKey: supKeys.unread });
  const fresh: ChatCache = { items: page.items, older: Math.max(0, page.total - page.raw), ticket: page.ticket };
  if (!prev) return fresh;
  const known = new Set(prev.items.map((m) => m.id));
  const joined = page.raw < CHAT_PAGE || page.items.some((m) => known.has(m.id));
  return joined ? { items: mergeChat(prev.items, page.items), older: prev.older, ticket: page.ticket ?? prev.ticket } : fresh;
}

export async function loadOlder(qc: QueryClient, id: string): Promise<void> {
  const cur = qc.getQueryData<ChatCache>(supKeys.chat(id));
  if (!cur || cur.older <= 0) return;
  const from = Math.max(0, cur.older - CHAT_PAGE);
  const page = await listMessages(id, { order: "asc", offset: from, limit: cur.older - from });
  qc.setQueryData<ChatCache>(supKeys.chat(id), (old) => old && { ...old, items: mergeChat(old.items, page.items), older: from });
}

/** Put messages (sent by me, or pushed by the socket) straight into the open chat. */
export function pushMessages(qc: QueryClient, id: string, msgs: SupportMessage[]): boolean {
  if (!msgs.length || !qc.getQueryData(supKeys.chat(id))) return false;
  qc.setQueryData<ChatCache>(supKeys.chat(id), (old) => old && { ...old, items: mergeChat(old.items, msgs) });
  return true;
}
