import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { POLL_TASK } from "./task";

// The OS decides when the job really runs (Android WorkManager: no more often than every 15 min;
// iOS BGTaskScheduler: opportunistic). Registering is idempotent.
export async function enablePolling(): Promise<void> {
  try {
    if ((await BackgroundTask.getStatusAsync()) !== BackgroundTask.BackgroundTaskStatus.Available) return;
    if (!(await TaskManager.isTaskRegisteredAsync(POLL_TASK))) await BackgroundTask.registerTaskAsync(POLL_TASK, { minimumInterval: 15 });
  } catch {
    /* restricted (battery saver, simulator): realtime alerts still work while the app is alive */
  }
}

export async function disablePolling(): Promise<void> {
  try {
    if (await TaskManager.isTaskRegisteredAsync(POLL_TASK)) await BackgroundTask.unregisterTaskAsync(POLL_TASK);
  } catch {
    /* already gone */
  }
}
