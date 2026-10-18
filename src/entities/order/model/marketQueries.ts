import { useQuery } from "@tanstack/react-query";
import { getStatusHistory, listMarketOrders } from "../api/marketApi";

export const marketKeys = { list: ["market-orders"] as const, history: (id: string) => ["market-history", id] as const };

// Pass `enabled` = signed in. Refetched by useMarketOrderSync on socket events.
export const useMarketOrders = (enabled: boolean) =>
  useQuery({ queryKey: marketKeys.list, queryFn: listMarketOrders, enabled, staleTime: 30 * 1000 });

// One purchase, found by its order id or by the work number in the route.
// `pollMs` is a slow safety net (the socket normally pushes the change first).
export const useMarketOrder = (key: string, enabled: boolean, pollMs = 0) =>
  useQuery({ queryKey: marketKeys.list, queryFn: listMarketOrders, enabled: enabled && !!key, staleTime: 30 * 1000, refetchInterval: pollMs || false, select: (rows) => rows.find((o) => o.id === key || o.workId === key) ?? null });

export const useStatusHistory = (orderId: string) =>
  useQuery({ queryKey: marketKeys.history(orderId), queryFn: () => getStatusHistory(orderId), enabled: !!orderId, staleTime: 30 * 1000 });
