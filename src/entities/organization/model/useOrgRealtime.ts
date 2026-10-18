import { useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents } from "@/shared/realtime";
import { orgKeys } from "./keys";

const EVENTS = ["notification.created", "marketplace_purchase_approved", "urgent_advokat.", "document_request."];

// Keeps the owner screens current without polling: work and promotion events (and a socket reconnect)
// refetch whatever organization query is on screen.
export function useOrgRealtime(): void {
  const qc = useQueryClient();
  const refresh = () => void qc.invalidateQueries({ queryKey: orgKeys.all });
  useUserEvents(EVENTS, refresh);
  useResync(refresh);
}
