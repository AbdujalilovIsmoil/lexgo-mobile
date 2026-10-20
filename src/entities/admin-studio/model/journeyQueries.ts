import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { usePaged } from "@/shared/lib/usePaged";
import { getJourney, journeyAction, listJourneyDefs, listJourneys, patchJourney, startJourney } from "../api/journeyApi";
import { studioKeys } from "./queries";

const K = [...studioKeys.all, "journeys"] as const;

export const useJourneys = (status: string) =>
  usePaged([...K, "list", status], ({ limit, offset }) => listJourneys({ status, limit, offset }).then((r) => ({ items: r.items, total: r.total, hasMore: offset + r.items.length < r.total })));
export const useJourney = (id: string) => useQuery({ queryKey: [...K, "one", id], queryFn: () => getJourney(id), enabled: !!id });
export const useJourneyDefs = () => useQuery({ queryKey: [...K, "defs"], queryFn: listJourneyDefs, staleTime: 10 * 60_000 });

export const useStartJourney = () => useAdminMutation({ mutationFn: startJourney, invalidate: [K], success: "admStudioD.journeys.created" });
export const useJourneyAction = () => useAdminMutation({ mutationFn: (v: { id: string; action: "abandon" | "archive" | "restore" }) => journeyAction(v.id, v.action), invalidate: [K], success: "admStudioD.journeys.updated" });
export function usePatchJourney() {
  const qc = useQueryClient();
  return useAdminMutation({
    mutationFn: (v: { id: string; completed: string[]; current: string }) => patchJourney(v.id, v),
    invalidate: [K],
    onSuccess: (j) => qc.setQueryData([...K, "one", j.id], j),
  });
}
