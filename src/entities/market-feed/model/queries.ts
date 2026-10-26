import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsFocused } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { listJobs, takeJob } from "../api/jobApi";

export const marketKeys = { feed: ["market-feed"] as const };

// The live feed: refreshed every half minute while its screen is the one on view (new orders arrive and others get taken) — not under a
// job pushed over it, nor on a tab left mounted in the background.
export const useJobs = () => {
  const authed = useIsAuthed();
  const focused = useIsFocused();
  return useQuery({ queryKey: marketKeys.feed, queryFn: listJobs, enabled: authed, staleTime: 15_000, refetchInterval: focused ? 30_000 : false });
};

// Take a job: the feed, the seller's own orders and the home numbers refresh afterwards.
export function useTakeJob(onDone?: (r: "accepted" | "taken") => void) {
  const qc = useQueryClient();
  return useAdminMutation({
    mutationFn: takeJob,
    invalidate: [marketKeys.feed, ["pro-order"], ["orders"], ["lawyer-cabinet"]],
    onSuccess: (r) => { onDone?.(r); void qc.invalidateQueries({ queryKey: marketKeys.feed }); },
  });
}
