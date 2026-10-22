import { useEffect, useRef } from "react";
import { useRootNavigationState, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { useQueryClient } from "@tanstack/react-query";
import { markIdsRead } from "@/entities/notification";
import { currentViewer, openLink } from "@/features/open-link";
import { translate } from "@/shared/i18n/useT";
import { useLocaleStore } from "@/shared/i18n/localeStore";
import { asDict, asStr } from "@/shared/lib/json";
import { toast } from "@/shared/ui";
import { remoteDataOf } from "./remoteData";
import { advanceWatermark } from "./seen";

// PushRouter: a tap on an OS notification (cold start included) opens the screen the event is about,
// checked against the signed-in user's role and the resource's state (openLink); the notification is
// marked read. Anything that resolves to nothing lands on the notification list.
export function useResponseRouter(): void {
  const router = useRouter();
  const qc = useQueryClient();
  const ready = !!useRootNavigationState()?.key;
  const handled = useRef(new Set<string>());

  useEffect(() => {
    if (!ready) return;
    const handle = (r: Notifications.NotificationResponse) => {
      const id = `${r.notification.request.identifier}:${r.notification.date}`;
      if (handled.current.has(id)) return;
      handled.current.add(id);
      const d = asDict(r.notification.request.content.data);
      const t = (key: string) => translate(useLocaleStore.getState().locale, key);
      const remote = remoteDataOf(r);
      const event = asStr(d.event) || remote.type; // a local alert says `event`, a remote push `type`
      if (event.startsWith("tasks.")) {
        const task = remote.taskId || asStr(d.task_id);
        router.navigate((task ? `/team-tasks?task=${encodeURIComponent(task)}` : "/team-tasks") as never); // a task alert opens that task
        return;
      }
      const input = { event, category: asStr(d.category), entityType: asStr(d.entity_type), entityId: asStr(d.entity_id), deepLink: asStr(d.deep_link), data: d };
      void openLink({ input }, currentViewer(), { navigate: (h) => router.navigate(h as never), say: toast, t }, "push_tap").then((res) => {
        if (res === "none") router.navigate("/notifications");
      });
      void markIdsRead(qc, asStr(d.nids).split(",").filter(Boolean));
      void advanceWatermark(new Date().toISOString());
    };
    const last = Notifications.getLastNotificationResponse();
    if (last) {
      handle(last);
      Notifications.clearLastNotificationResponse();
    }
    const sub = Notifications.addNotificationResponseReceivedListener(handle);
    return () => sub.remove();
  }, [ready, router, qc]);
}
