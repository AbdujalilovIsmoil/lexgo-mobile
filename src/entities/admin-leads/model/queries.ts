import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsFocused } from "expo-router";
import { getTimeline } from "../api/activityApi";
import { getBoard } from "../api/leadApi";
import type { LeadScope } from "../api/scope";
import { useLeadScope } from "./scope";

export const leadKeys = {
  all: ["admin-leads"] as const,
  boards: ["admin-leads", "board"] as const,
  board: (scope: LeadScope) => ["admin-leads", "board", scope] as const,
  timeline: ["admin-leads", "timeline"] as const,
};

// The whole board; every action patches it in place and refetches in the background. New leads arrive without an
// event, so the focused board re-reads itself every minute (never while a move / edit is in flight: it would undo the optimistic card).
export function useBoard() {
  const scope = useLeadScope();
  const qc = useQueryClient();
  const focused = useIsFocused();
  return useQuery({ queryKey: leadKeys.board(scope), queryFn: () => getBoard(scope), staleTime: 30_000, refetchInterval: focused ? () => (qc.isMutating() > 0 ? false : 60_000) : false });
}

export function useTimeline(leadId: string) {
  const scope = useLeadScope();
  return useQuery({ queryKey: [...leadKeys.timeline, scope, leadId], queryFn: () => getTimeline(scope, leadId), enabled: !!leadId });
}
