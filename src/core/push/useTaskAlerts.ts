import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { usePathname } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAccess } from "@/entities/access";
import { localPrefs, normNotification, showBanner } from "@/entities/notification";
import { useSession } from "@/entities/session";
import { getHistoryOf, getTaskOf } from "@/entities/team-tasks";
import { useT } from "@/shared/i18n";
import { asDict, asNum, asStr } from "@/shared/lib/json";
import { useUserEvents } from "@/shared/realtime";
import { showLocalAlert } from "@/shared/push";
import { alertAllowed } from "./prefsGate";
import { markSeen, wasSeen } from "./seen";

// A task event on the user socket that concerns THIS person becomes an alert: given a task, sent back for rework, or ready for the
// check. The event itself only names the task, so the task is fetched and the person's own part in it decides. The app open: a banner
// (unless the task list is on screen, which refreshes by itself); in the background but still connected: an OS notification.
// With the app closed the backend's remote push (POST /devices) brings the same alert; a tap on it opens the task (/team-tasks?task=<id>).
export function useTaskAlerts(): void {
  const { t } = useT();
  const qc = useQueryClient();
  const pathname = usePathname();
  const path = useRef(pathname);
  useEffect(() => {
    path.current = pathname;
  });
  const me = useSession()?.user.id ?? "";
  const canSee = useAccess().can("tasks.view");
  useUserEvents(["tasks.assigned", "tasks.returned", "tasks.status_changed"], (e) => {
    const d = asDict(e);
    const id = asStr(d.task_id);
    const event = asStr(d.event);
    if (!me || !canSee || !id) return;
    const key = `task:${id}:${asNum(d.lock_version, 0)}:${event}`;
    if (wasSeen(key)) return;
    markSeen(key, "");
    void (async () => {
      const task = await getTaskOf(id).catch(() => null);
      if (!task) return;
      const mine = task.assignees.some((p) => p.id === me);
      let title = "";
      let body = `${task.code} — ${task.title}`;
      if (event === "tasks.assigned" && mine) title = t("ttm.alert.assigned");
      else if (event === "tasks.returned" && mine) {
        title = t("ttm.alert.returned");
        const back = (await getHistoryOf(id).catch(() => [])).find((h) => h.event === "returned");
        if (back?.comment) body = `${task.code}: ${back.comment}`;
      } else if (event === "tasks.status_changed" && task.status === "testing" && task.actions.next.includes("ready")) title = t("ttm.alert.testing");
      if (!title) return;
      const n = normNotification({ id: key, title, body, event, category: "system", read: false, created_at: new Date().toISOString(), data: { task_id: id } });
      const local = localPrefs();
      if (AppState.currentState === "active") {
        if (local.banner && !path.current.startsWith("/team-tasks")) showBanner(n);
        return;
      }
      if (local.background && (await alertAllowed(qc, n))) void showLocalAlert({ id: key.slice(0, 80), title, body, category: "system", event, data: { task_id: id }, sound: local.sound });
    })();
  });
}
