import type { Chat } from "../model/types";

export type ChatGroupKey = "today" | "yesterday" | "week" | "earlier";
export type ChatGroup = { key: ChatGroupKey; items: Chat[] };

const DAY = 86_400_000;
const startOfDay = (t: number) => new Date(t).setHours(0, 0, 0, 0);

// Newest first: today, yesterday, the last 7 days, older. `chats` must already be sorted by activity.
export function groupChats(chats: Chat[], now = Date.now()): ChatGroup[] {
  const today = startOfDay(now);
  const buckets: Record<ChatGroupKey, Chat[]> = { today: [], yesterday: [], week: [], earlier: [] };
  for (const c of chats) {
    const at = Date.parse(c.updatedAt ?? "");
    const key: ChatGroupKey = !Number.isFinite(at) ? "earlier" : at >= today ? "today" : at >= today - DAY ? "yesterday" : at >= today - 7 * DAY ? "week" : "earlier";
    buckets[key].push(c);
  }
  return (["today", "yesterday", "week", "earlier"] as const).filter((k) => buckets[k].length).map((key) => ({ key, items: buckets[key] }));
}

// Client-side search (the API has no query parameter): title and last message.
export function filterChats(chats: Chat[], q: string): Chat[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return chats;
  return chats.filter((c) => `${c.title} ${c.lastMessage ?? ""}`.toLowerCase().includes(needle));
}

// Chat rows show the clock time for today's chats, the date otherwise.
export function isToday(iso: string | undefined): boolean {
  const at = Date.parse(iso ?? "");
  return Number.isFinite(at) && at >= startOfDay(Date.now());
}
