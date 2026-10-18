import { UrgentWatcher } from "@/features/urgent-request";

// App-level mount point of the Urg package: one watcher keeps every Tezkor Advokat screen live and tells the
// user about the moments that matter (taken, scheduled, meeting started, completed, cancelled).
export function UrgMounts() {
  return <UrgentWatcher />;
}
