import { useEffect, useRef } from "react";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useUserEvents } from "@/shared/realtime";
import { ApiError } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import { getChecklist, getFinancials, getRefund, getRuntimeCaps, getTimeline } from "../api/flowApi";
import { normChecklist } from "../api/norm";
import type { Checklist } from "./types";

export const flowKeys = {
  all: ["mf"] as const,
  fin: (id: string) => ["mf", "fin", id] as const,
  ck: (id: string) => ["mf", "ck", id] as const,
  tl: (id: string) => ["mf", "tl", id] as const,
  rf: (id: string) => ["mf", "rf", id] as const,
  caps: ["mf-caps"] as const,
};

export const useFinancials = (orderId: string, url: string, enabled: boolean) =>
  useQuery({ queryKey: flowKeys.fin(orderId), queryFn: () => getFinancials(orderId, url), enabled: enabled && !!orderId, staleTime: 30 * 1000, retry: 1 });

// A 403/404 is an answer (not this user's checklist, or gone), not a glitch: it is not retried.
const once = (n: number, e: unknown) => n < 1 && !(e instanceof ApiError && (e.status === 403 || e.status === 404));

export const useChecklist = (orderId: string, url: string, enabled: boolean) =>
  useQuery({ queryKey: flowKeys.ck(orderId), queryFn: () => getChecklist(orderId, url), enabled: enabled && !!orderId, staleTime: 15 * 1000, retry: once });

export const useFlowTimeline = (orderId: string, enabled = true) =>
  useQuery({ queryKey: flowKeys.tl(orderId), queryFn: () => getTimeline(orderId), enabled: enabled && !!orderId, staleTime: 30 * 1000, retry: 1 });

export const useRefund = (orderId: string, enabled: boolean) =>
  useQuery({ queryKey: flowKeys.rf(orderId), queryFn: () => getRefund(orderId), enabled: enabled && !!orderId, staleTime: 30 * 1000, retry: 1 });

export const useRuntimeCaps = (enabled = true) => useQuery({ queryKey: flowKeys.caps, queryFn: getRuntimeCaps, enabled, staleTime: 60 * 60 * 1000, retry: 1 });

const WATCH = ["marketplace.", "marketplace_", "order.", "order_", "payment.", "notification.created"];
const INNER = /^(order_|marketplace|payment_paid|checklist)/;

export const refreshFlow = (qc: QueryClient) => void qc.invalidateQueries({ queryKey: flowKeys.all });

// Keeps the open order's sub-resources fresh (TZ §2, §15): a socket event about orders / payments re-reads financials, checklist and
// timeline. A reconnect and a return to the foreground re-read them through core MarketMounts (doing it here too cancelled that request
// and sent it again).
export function useFlowLive(): void {
  const qc = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soon = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => refreshFlow(qc), 400);
  };
  useUserEvents(WATCH, (e) => {
    // TZ §9.6: checklist_updated carries the role-safe list — it replaces the open checklist at once, the GET follows in the background.
    const orderId = asStr(e.order_id);
    if (e.event === "marketplace.checklist_updated" && orderId && Array.isArray(e.items)) {
      qc.setQueryData<Checklist>(flowKeys.ck(orderId), (old) => (old ? { ...old, ...normChecklist({ order_id: orderId, items: asArr(e.items) }, orderId), uploadRoomId: old.uploadRoomId, snapshotLocked: old.snapshotLocked, phase: old.phase } : old));
    }
    if (e.event !== "notification.created" || INNER.test(asStr(asDict(asDict(e.notification).data).event))) soon();
  });
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
}
