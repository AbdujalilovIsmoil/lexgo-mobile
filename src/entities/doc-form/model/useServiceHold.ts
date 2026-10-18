import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserEvents } from "@/shared/realtime";
import { getServiceHold } from "../api/holdApi";

// Is an advocate request open for this document? Refreshes on document_request.* events.
export function useServiceHold(serviceId: string, enabled: boolean) {
  const qc = useQueryClient();
  const key = ["doc-hold", serviceId] as const;
  useUserEvents("document_request.", () => void qc.invalidateQueries({ queryKey: key }));
  return useQuery({ queryKey: key, queryFn: () => getServiceHold(serviceId), enabled: enabled && !!serviceId, staleTime: 60 * 1000 });
}
