import { useEffect, useState } from "react";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { useLocalPrefs } from "@/entities/notification";
import { POLL_TASK_NAME } from "./constants";

// Whether the OS lets the periodic check run: "active" / "restricted" (battery saver, low power) / "off".
export function usePollingStatus(): "active" | "restricted" | "off" | null {
  const wanted = useLocalPrefs((s) => s.background);
  const [status, setStatus] = useState<"active" | "restricted" | "off" | null>(null);
  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const avail = (await BackgroundTask.getStatusAsync()) === BackgroundTask.BackgroundTaskStatus.Available;
        const reg = await TaskManager.isTaskRegisteredAsync(POLL_TASK_NAME);
        if (alive) setStatus(!wanted || !reg ? "off" : avail ? "active" : "restricted");
      } catch {
        if (alive) setStatus(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [wanted]);
  return status;
}
