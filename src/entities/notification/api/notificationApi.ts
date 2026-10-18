import { http } from "@/shared/api";
import { asNum, listFrom } from "@/shared/lib/json";
import { normNotification } from "./normalize";
import type { Notification } from "../model/types";

export const PAGE_ROWS = 100; // the backend ceiling; ~5 channel rows fold into one event

// One page of raw per-channel rows, newest first. Folding happens later, over everything loaded.
export async function listRows(p: { offset: number; unreadOnly?: boolean; limit?: number; signal?: AbortSignal }): Promise<Notification[]> {
  const qs = new URLSearchParams({ limit: String(p.limit ?? PAGE_ROWS), offset: String(p.offset) });
  if (p.unreadOnly) qs.set("unread_only", "true");
  const data = await http(`/notifications?${qs}`, { signal: p.signal });
  return listFrom(data, "notifications", "items", "data").map(normNotification);
}

// The server counts per-channel rows, so this is larger than the number of events shown.
export async function serverUnreadRows(): Promise<number> {
  const d = await http<unknown>("/notifications/unread-count");
  return asNum((d as { count?: unknown } | undefined)?.count);
}

export async function markAllRead(): Promise<void> {
  await http("/notifications/read-all", { method: "POST" });
}

// An event stands for several rows (one per channel): mark them all.
export async function markRead(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => http(`/notifications/${encodeURIComponent(id)}/read`, { method: "POST" })));
}
