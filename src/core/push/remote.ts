import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { dismissCallAlerts } from "@/shared/push";
import { remoteDataOf } from "./remoteData";

export const REMOTE_TASK = "lexgo-remote-push";

// Runs for every remote push, with the app in the foreground, the background or (for a data-only push) closed. The ring is over
// (`call.ended`): the notification of that call is taken away, so a phone that was ringing stops. Everything else is shown by the system.
// Module scope: the OS can start the app headlessly just to run this.
TaskManager.defineTask(REMOTE_TASK, async ({ data, error }: { data: unknown; error: unknown }) => {
  if (error) return;
  const d = remoteDataOf(data);
  if (d.type === "call.ended" && d.callId) await dismissCallAlerts(d.callId);
});

Notifications.registerTaskAsync(REMOTE_TASK).catch(() => undefined);
