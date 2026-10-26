import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { listOrders } from "../api/orderApi";
import { getPaymentPolicy, getPriceQuote } from "../api/paymentApi";
import type { Order } from "./types";

export const orderKeys = { list: ["orders"] as const };

function useOrderList(select?: (rows: Order[]) => Order[]) {
  const authed = useIsAuthed();
  return useQuery({ queryKey: orderKeys.list, queryFn: listOrders, enabled: authed, staleTime: 60 * 1000, select });
}

export const useOrders = () => useOrderList();

export const usePaymentPolicy = (orderId: string) =>
  useQuery({ queryKey: ["payment-policy", orderId], queryFn: () => getPaymentPolicy(orderId), enabled: !!orderId });

export const usePriceQuote = (serviceId: string, lawyerUserId: string, region = "", packageId = "") =>
  useQuery({ queryKey: ["price-quote", serviceId, lawyerUserId, region, packageId], queryFn: () => getPriceQuote(serviceId, lawyerUserId, region, packageId), enabled: !!serviceId && !!lawyerUserId, staleTime: 60 * 1000 });

// One service order by id or ORD number (same cache as the list).
export function useServiceOrder(key: string) {
  const authed = useIsAuthed();
  return useQuery({ queryKey: orderKeys.list, queryFn: listOrders, enabled: authed && !!key, staleTime: 60 * 1000, select: (rows) => rows.find((o) => o.id === key || o.workId === key) ?? null });
}
