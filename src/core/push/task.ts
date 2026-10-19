import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { backgroundSync } from "../background/sync";
import { pollNotifications } from "./poll";

export const POLL_TASK = "lexgo-notification-poll";

// Must be defined at module scope: the OS can start the app headlessly just to run this.
TaskManager.defineTask(POLL_TASK, async () => {
  // One OS-scheduled job does both: the alert poll (first, it is time-critical) and the offline sync (outbox + cache refresh).
  let ok = true;
  try {
    await pollNotifications();
  } catch {
    ok = false;
  }
  try {
    await backgroundSync();
  } catch {
    ok = false;
  }
  return ok ? BackgroundTask.BackgroundTaskResult.Success : BackgroundTask.BackgroundTaskResult.Failed;
});
