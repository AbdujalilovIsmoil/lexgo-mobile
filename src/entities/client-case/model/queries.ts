import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { useUserEvents } from "@/shared/realtime";
import { caseReplacement, listCaseDocs } from "../api/requestApi";
import { listCaseOrders, listCases } from "../api/caseApi";
import { DEFAULT_HOURS, fetchBusinessHours } from "../api/hoursApi";
import { listMilestones, orderHistory } from "../api/orderFlowApi";
import { joinItems } from "../lib/items";

export const caseKeys = {
  all: ["client-cases"] as const,
  docs: (id: string) => ["client-cases", "docs", id] as const,
  repl: (id: string) => ["client-cases", "repl", id] as const,
  history: (id: string) => ["client-cases", "history", id] as const,
  stages: (id: string) => ["client-cases", "stages", id] as const,
};

// Cases + orders of the signed-in client, joined like the web page does.
export function useCaseItems() {
  const authed = useIsAuthed();
  const qc = useQueryClient();
  const cases = useQuery({ queryKey: [...caseKeys.all, "cases"], queryFn: listCases, enabled: authed });
  const orders = useQuery({ queryKey: [...caseKeys.all, "orders"], queryFn: listCaseOrders, enabled: authed });
  useUserEvents(["case.", "order.", "marketplace.", "payment."], () => void qc.invalidateQueries({ queryKey: caseKeys.all }));
  const items = useMemo(() => joinItems(cases.data ?? [], orders.data ?? []), [cases.data, orders.data]);
  const refetch = () => void Promise.all([cases.refetch(), orders.refetch()]);
  return { items, isLoading: cases.isLoading || orders.isLoading, isError: cases.isError && orders.isError, error: cases.error ?? orders.error, isRefetching: cases.isRefetching || orders.isRefetching, refetch };
}

export const useBusinessHours = () => useQuery({ queryKey: [...caseKeys.all, "hours"], queryFn: fetchBusinessHours, staleTime: 10 * 60 * 1000 }).data ?? DEFAULT_HOURS;
export const useCaseDocs = (caseId: string) => useQuery({ queryKey: caseKeys.docs(caseId), queryFn: () => listCaseDocs(caseId), enabled: !!caseId });
export const useReplacement = (caseId: string) => useQuery({ queryKey: caseKeys.repl(caseId), queryFn: () => caseReplacement(caseId), retry: false });
export const useOrderHistory = (orderId: string) => useQuery({ queryKey: caseKeys.history(orderId), queryFn: () => orderHistory(orderId), enabled: !!orderId });
export const useMilestones = (orderId: string) => useQuery({ queryKey: caseKeys.stages(orderId), queryFn: () => listMilestones(orderId), enabled: !!orderId, retry: false });
