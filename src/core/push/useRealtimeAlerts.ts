import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { usePathname } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { alertText, foldKey, localPrefs, normNotification, showBanner } from "@/entities/notification";
import { useT } from "@/shared/i18n";
import { asDict } from "@/shared/lib/json";
import { useUserEvents } from "@/shared/realtime";
import { showLocalAlert } from "@/shared/push";
import { alertAllowed } from "./prefsGate";
import { onScreen } from "./onScreen";
import { markSeen, wasSeen } from "./seen";

// Every notification.created on the user socket becomes ONE alert per event (the server writes a row
// per delivery channel, so the fold key de-duplicates): an in-app banner while the app is open, an OS
// notification while it is in the background but still connected. Remote push is not available (D3).
export function useRealtimeAlerts(): void {
  const { t } = useT();
  const qc = useQueryClient();
  const pathname = usePathname();
  const path = useRef(pathname);
  useEffect(() => {
    path.current = pathname;
  });
  useUserEvents("notification.created", (e) => {
    const n = normNotification(asDict(e).notification ?? e);
    const key = foldKey(n);
    if (!n.id || n.read || wasSeen(key)) return;
    markSeen(key, n.createdAt);
    const local = localPrefs();
    if (AppState.currentState === "active") {
      if (local.banner && !onScreen(n, path.current)) showBanner(n);
      return;
    }
    if (!local.background) return;
    void alertAllowed(qc, n).then((ok) => {
      if (ok) void showLocalAlert({ id: key.slice(0, 80), ...alertText(n, t), category: n.category, event: n.event, data: n.data, ids: n.ids, sound: local.sound });
    });
  });
}
