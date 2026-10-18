import { useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents, type UserEvent } from "@/shared/realtime";
import { urgentKeys } from "./keys";

// Every `urgent_advokat.*` frame (and every socket reconnect) refetches the module's queries — no polling needed.
export function useUrgentLive(onEvent?: (e: UserEvent) => void): void {
  const qc = useQueryClient();
  const refresh = () => void qc.invalidateQueries({ queryKey: urgentKeys.all });
  useUserEvents(["urgent_advokat.", "support.assist_urgent_advokat_request_created"], (e) => {
    refresh();
    onEvent?.(e);
  });
  useResync(refresh);
}
