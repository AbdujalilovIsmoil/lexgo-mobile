import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents } from "@/shared/realtime";
import { asDict, asStr } from "@/shared/lib/json";
import { getChecklist, getFinancials, getRuntimeCaps, getTimeline } from "../api/flowApi";

export const flowKeys = {
  all: ["mf"] as const,
  fin: (id: string) => ["mf", "fin", id] as const,
  ck: (id: string) => ["mf", "ck", id] as const,
  tl: (id: string) => ["mf", "tl", id] as const,
  caps: ["mf-caps"] as const,
};

export const useFinancials = (orderId: string, url: string, enabled: boolean) =>
  useQuery({ queryKey: flowKeys.fin(orderId), queryFn: () => getFinancials(orderId, url), enabled: enabled && !!orderId, staleTime: 30 * 1000, retry: 1 });

export const useChecklist = (orderId: string, url: string, enabled: boolean) =>
  useQuery({ queryKey: flowKeys.ck(orderId), queryFn: () => getChecklist(orderId, url), enabled: enabled && !!orderId, staleTime: 15 * 1000, retry: 1 });

export const useFlowTimeline = (orderId: string, enabled = true) =>
  useQuery({ queryKey: flowKeys.tl(orderId), queryFn: () => getTimeline(orderId), enabled: enabled && !!orderId, staleTime: 30 * 1000, retry: 1 });

export const useRuntimeCaps = (enabled = true) => useQuery({ queryKey: flowKeys.caps, queryFn: getRuntimeCaps, enabled, staleTime: 60 * 60 * 1000, retry: 1 });

const WATCH = ["marketplace.", "order.", "payment.", "notification.created"];
const INNER = /^(order_|marketplace|payment_paid|checklist)/;

export const refreshFlow = (qc: QueryClient) => void qc.invalidateQueries({ queryKey: flowKeys.all });

// Keeps the open order's sub-resources fresh (TZ §2, §15): a socket event about orders / payments, a reconnect or the app coming back to the
// foreground re-reads financials, checklist and timeline — a missed push never leaves them stale.
export function useFlowLive(): void {
  const qc = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soon = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => refreshFlow(qc), 400);
  };
  useUserEvents(WATCH, (e) => {
    if (e.event !== "notification.created" || INNER.test(asStr(asDict(asDict(e.notification).data).event))) soon();
  });
  useResync(soon);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => s === "active" && soon());
    return () => {
      sub.remove();
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
