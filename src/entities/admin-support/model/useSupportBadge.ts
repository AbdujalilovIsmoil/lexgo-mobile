import { useEffect } from "react";
import { useQueries } from "@tanstack/react-query";
import { setBadge } from "@/shared/lib/badgeStore";
import { listQueue } from "../api/ticketApi";
import { TAB_QUERY } from "../lib/tickets";
import { supKeys } from "./keys";

const WAITING = ["new", "transferred"] as const;

// Operator's "Support" tab badge: tickets that wait for an operator plus those transferred to the queue.
// Refreshed by `support.*` events (they invalidate supKeys.counts) and once a minute while the app is active.
export function useSupportBadge(enabled: boolean): number {
  const res = useQueries({
    queries: WAITING.map((tab) => ({
      queryKey: [...supKeys.counts, "badge", tab],
      queryFn: () => listQueue(TAB_QUERY[tab], { limit: 1, offset: 0 }),
      enabled,
      retry: false,
      refetchInterval: 60_000,
    })),
  });
  const n = enabled ? res.reduce((sum, r) => sum + (r.data?.total ?? 0), 0) : 0;
  useEffect(() => setBadge("support", n), [n]);
  return n;
}
