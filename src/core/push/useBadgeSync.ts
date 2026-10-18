import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useUnreadIndex } from "@/entities/notification";
import { setBadge } from "@/shared/lib/badgeStore";
import { usePermissionStore } from "@/shared/push";

// The unread EVENT count (what the list shows) → the tab badge and the app-icon badge. The server's
// own number counts per-channel copies, so it is only used to notice drift (entities/notification/sync).
export function useBadgeSync(): void {
  const events = useUnreadIndex().data?.items.length;
  const granted = usePermissionStore((s) => s.status === "granted");
  useEffect(() => {
    if (events === undefined) return;
    setBadge("notifications", events);
    if (granted) void Notifications.setBadgeCountAsync(events).catch(() => {});
  }, [events, granted]);
}
