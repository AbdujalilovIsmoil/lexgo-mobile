import { useNotificationSync, usePrefs } from "@/entities/notification";
import { useAskCallAlerts } from "./useAskCallAlerts";
import { useBadgeSync } from "./useBadgeSync";
import { usePermissionSync } from "./usePermissionSync";
import { usePolling } from "./usePolling";
import { usePushToken } from "./usePushToken";
import { useRealtimeAlerts } from "./useRealtimeAlerts";
import { useTaskAlerts } from "./useTaskAlerts";
import { useResponseRouter } from "./useResponseRouter";
import "./handler";
import "./task";

// Everything that turns notification events into something the user notices: permission state,
// channels, the badge, banners / OS alerts from the socket, taps on OS notifications, the periodic job.
export function PushMount() {
  useNotificationSync();
  usePrefs(); // TZ 5: preferences are read at start, so the alert gate never waits for them
  usePermissionSync();
  useAskCallAlerts();
  useBadgeSync();
  useRealtimeAlerts();
  useTaskAlerts();
  useResponseRouter();
  usePolling();
  usePushToken();
  return null;
}
