import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { notificationKeys } from "./keys";
import type { Notification } from "./types";

type Pages = InfiniteData<Notification[]>;

// A row pushed on the socket goes to the top of the loaded list and into the unread index.
export function addRow(qc: QueryClient, row: Notification): void {
  const list = qc.getQueryData<Pages>(notificationKeys.list);
  if (list && !list.pages.some((p) => p.some((r) => r.id === row.id))) {
    qc.setQueryData<Pages>(notificationKeys.list, { ...list, pages: [[row, ...(list.pages[0] ?? [])], ...list.pages.slice(1)] });
  }
  if (row.read) return;
  qc.setQueryData<Notification[]>(notificationKeys.unread, (rows) => (rows && !rows.some((r) => r.id === row.id) ? [row, ...rows] : rows));
}

// `ids === null` marks everything read (read-all).
export function markRowsRead(qc: QueryClient, ids: string[] | null): void {
  const hit = (id: string) => !ids || ids.includes(id);
  qc.setQueryData<Pages>(notificationKeys.list, (d) => d && { ...d, pages: d.pages.map((p) => p.map((r) => (hit(r.id) ? { ...r, read: true } : r))) });
  qc.setQueryData<Notification[]>(notificationKeys.unread, (rows) => rows?.filter((r) => !hit(r.id)));
}

export const invalidateNotifications = (qc: QueryClient): Promise<void> => qc.invalidateQueries({ queryKey: notificationKeys.all });
