import type { ChatMessage } from "@/entities/chat";

// Pure transforms of the open conversation (kept free of imports so they are easy to test).
const isLocal = (id: string) => id.startsWith("local_");
const sameText = (a: ChatMessage, b: ChatMessage) => a.role === b.role && a.content.trim() === b.content.trim();

// A server message replaces its optimistic twin (same text, still local) or the entry with the same id.
export function upsertMessage(list: ChatMessage[], m: ChatMessage): ChatMessage[] {
  const at = list.findIndex((x) => x.id === m.id);
  if (at >= 0) return list.map((x, i) => (i === at ? { ...x, ...m, pending: false, failed: false, streaming: false } : x));
  const twin = m.role === "user" ? list.findIndex((x) => isLocal(x.id) && sameText(x, m)) : -1;
  if (twin >= 0) return list.map((x, i) => (i === twin ? { ...m } : x));
  return [...list, m];
}

// The REST answer to a send: swap the local user bubble for the server's one, or drop it when the socket was faster.
export function settleLocal(list: ChatMessage[], localId: string, server?: ChatMessage): ChatMessage[] {
  if (!server) return list.map((x) => (x.id === localId ? { ...x, pending: false } : x));
  if (list.some((x) => x.id === server.id)) return list.filter((x) => x.id !== localId);
  return list.map((x) => (x.id === localId ? server : x));
}

// Stream fragments assemble into ONE assistant message; the final message.created replaces it.
export function appendDelta(list: ChatMessage[], id: string, text: string): ChatMessage[] {
  const at = list.findIndex((x) => x.id === id);
  if (at < 0) return [...list, { id, role: "assistant", content: text, streaming: true }];
  return list.map((x, i) => (i === at ? { ...x, content: x.streaming ? x.content + text : text, streaming: true } : x));
}

// Reconcile with the server's final state: server order wins, unsent local bubbles stay at the end.
export function mergeServer(list: ChatMessage[], server: ChatMessage[]): ChatMessage[] {
  const used = new Set<number>();
  const keep = list.filter((x) => {
    if (!isLocal(x.id)) return false;
    const hit = server.findIndex((s, i) => !used.has(i) && sameText(s, x));
    if (hit >= 0) used.add(hit);
    return hit < 0;
  });
  return [...server, ...keep];
}
