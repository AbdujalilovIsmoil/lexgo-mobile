import { useQuery } from "@tanstack/react-query";
import { getMarketOrder, getStatusHistory, listMarketOrders } from "../api/marketApi";

export const marketKeys = { list: ["market-orders"] as const, detail: (key: string) => ["market-orders", "detail", key] as const, history: (id: string) => ["market-history", id] as const };

// Pass `enabled` = signed in. Refetched by useMarketOrderSync on socket events.
export const useMarketOrders = (enabled: boolean) =>
  useQuery({ queryKey: marketKeys.list, queryFn: listMarketOrders, enabled, staleTime: 30 * 1000 });

// One purchase by its order id (GET …/orders/{id}) or by the work number in the route (from the list); invalidating the list key
// refreshes it too. `pollMs` is a slow safety net (the socket normally pushes the change first).
export const useMarketOrder = (key: string, enabled: boolean, pollMs = 0) =>
  useQuery({ queryKey: marketKeys.detail(key), queryFn: () => getMarketOrder(key), enabled: enabled && !!key, staleTime: 15 * 1000, refetchInterval: pollMs || false });

export const useStatusHistory = (orderId: string) =>
  useQuery({ queryKey: marketKeys.history(orderId), queryFn: () => getStatusHistory(orderId), enabled: !!orderId, staleTime: 30 * 1000 });
