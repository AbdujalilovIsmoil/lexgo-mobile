import type { Msg } from "@/entities/secure-chat";

const stamp = (m: Msg) => Date.parse(m.createdAt) || 0;

/** Upserts by id (a re-read after a content reveal replaces the masked text) and keeps time order. */
export function mergeMessages(prev: Msg[], incoming: Msg[]): Msg[] {
  const map = new Map(prev.map((m) => [m.id, m]));
  for (const m of incoming) if (m.id) map.set(m.id, m);
  return [...map.values()].sort((a, b) => stamp(a) - stamp(b));
}

/** How many of the newest foreign messages are still unread — gives the id of the first one (for the divider). */
export function firstUnread(msgs: Msg[], myId: string, unread: number): string {
  if (unread <= 0) return "";
  const others = msgs.filter((m) => m.senderId !== myId && m.type !== "system" && !m.id.startsWith("tmp-"));
  return others.length >= unread ? others[others.length - unread].id : "";
}
