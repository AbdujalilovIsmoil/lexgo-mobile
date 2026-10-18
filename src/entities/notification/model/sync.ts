import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents } from "@/shared/realtime";
import { asDict, asNum, asStr } from "@/shared/lib/json";
import { normNotification } from "../api/normalize";
import { addRow, invalidateNotifications, markRowsRead } from "./cache";
import { notificationKeys } from "./keys";
import type { Notification } from "./types";

let reconcileTimer: ReturnType<typeof setTimeout> | undefined;
let lastServer = -1;

// The server counts per-channel rows; so does the unread index. A mismatch means we missed
// something, so the index is re-read once the burst of events (one per channel) has settled.
function reconcile(qc: QueryClient, count: unknown): void {
  lastServer = typeof count === "number" ? count : asNum(count, -1);
  clearTimeout(reconcileTimer);
  reconcileTimer = setTimeout(() => {
    const rows = qc.getQueryData<Notification[]>(notificationKeys.unread);
    if (rows && lastServer >= 0 && lastServer <= 300 && rows.length !== lastServer) void qc.invalidateQueries({ queryKey: notificationKeys.unread });
  }, 700);
}

// Keeps the list and the unread index live from /ws/users/me and re-reads them after a reconnect.
export function useNotificationSync(): void {
  const qc = useQueryClient();
  useUserEvents(["notification.created", "notification.read", "notifications.read_all", "notifications.unread_count"], (e) => {
    const d = asDict(e);
    if (e.event === "notification.created") {
      const row = normNotification(d.notification ?? d);
      if (row.id) addRow(qc, row);
      reconcile(qc, d.unread_count);
    } else if (e.event === "notification.read") {
      const id = asStr(d.notification_id ?? d.id);
      if (id) markRowsRead(qc, [id]);
      reconcile(qc, d.unread_count);
    } else if (e.event === "notifications.read_all") {
      markRowsRead(qc, null);
    } else reconcile(qc, d.count ?? d.unread_count);
  });
  useResync(() => void invalidateNotifications(qc));
}
