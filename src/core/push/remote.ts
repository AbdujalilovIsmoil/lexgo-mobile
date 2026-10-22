import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { declineFromNotification, ringFromPush } from "@/features/call";
import { CALL_DECLINE, dismissCallAlerts } from "@/shared/push";
import { remoteDataOf } from "./remoteData";

export const REMOTE_TASK = "lexgo-remote-push";

// Runs for every remote push — with the app in the foreground, in the background or (for a data-only push) closed — and, on Android,
// for a notification button pressed while the app is not open. `call.incoming` rings (the full-screen ring when the app is open, a
// call notification with Join / Decline otherwise: Android delivers calls as data-only pushes, which the system never shows by
// itself); `call.ended` takes that notification away; Decline answers the call without opening the app. Everything else is shown by
// the system. Module scope, imported by the app's entry (index.ts): the OS can start the app without a screen just to run this.
TaskManager.defineTask(REMOTE_TASK, async ({ data, error }: { data: unknown; error: unknown }) => {
  if (error) return;
  const d = remoteDataOf(data);
  if (d.action) {
    if (d.action === CALL_DECLINE) await declineFromNotification(d.roomId, d.callId);
    return; // Join / a plain tap open the app: the response router takes it from there
  }
  if (d.type === "call.ended" && d.callId) await dismissCallAlerts(d.callId);
  else if (d.type === "call.incoming") await ringFromPush(d);
});

Notifications.registerTaskAsync(REMOTE_TASK).catch(() => undefined);
