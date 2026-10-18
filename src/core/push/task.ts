import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { pollNotifications } from "./poll";

export const POLL_TASK = "lexgo-notification-poll";

// Must be defined at module scope: the OS can start the app headlessly just to run this.
TaskManager.defineTask(POLL_TASK, async () => {
  try {
    await pollNotifications();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});
