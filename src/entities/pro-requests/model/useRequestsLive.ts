import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setBadge } from "@/shared/lib/badgeStore";
import { useResync, useUserEvents } from "@/shared/realtime";
import { REQ_KINDS } from "../lib/status";
import { reqKeys, useRequests } from "./queries";
import type { ReqKind } from "./types";

// Items waiting for the professional per segment (+ total) and the "requests" tab badge. Mount it
// once on an always-visible professional page: it refetches on user-socket events and reconnects.
export function useRequestCounts(live = false) {
  const qc = useQueryClient();
  const q = { docs: useRequests("docs"), urgent: useRequests("urgent"), orders: useRequests("orders"), meetings: useRequests("meetings") };
  const refresh = () => void qc.invalidateQueries({ queryKey: reqKeys.all });
  useUserEvents(live ? ["document_request.", "urgent_advokat.", "marketplace.", "order.", "call."] : "__none__", refresh);
  useResync(live ? refresh : () => {});
  const active = (k: ReqKind) => (q[k].data ?? []).filter((x) => x.active).length;
  const action = (k: ReqKind) => (q[k].data ?? []).filter((x) => x.active && x.action).length;
  const counts = Object.fromEntries(REQ_KINDS.map((k) => [k, active(k)])) as Record<ReqKind, number>;
  const attention = REQ_KINDS.reduce((sum, k) => sum + action(k), 0);
  useEffect(() => {
    if (live) setBadge("requests", attention);
  }, [live, attention]);
  return { counts, attention, loading: Object.values(q).some((x) => x.isLoading) };
}
