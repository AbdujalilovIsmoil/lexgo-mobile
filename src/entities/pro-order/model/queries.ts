import { useQuery } from "@tanstack/react-query";
import { getHistory, getMilestones, getOrder, listOrders } from "../api/orderApi";

export const orderKeys = { all: ["pro-order"] as const };

export const useProOrders = () => useQuery({ queryKey: [...orderKeys.all, "list"], queryFn: listOrders });
// TZ §14: an order opened from a push (or anywhere) is always read again when its screen opens.
export const useProOrder = (id: string) => useQuery({ queryKey: [...orderKeys.all, "one", id], queryFn: () => getOrder(id), enabled: !!id, staleTime: 10 * 1000, refetchOnMount: "always" });
export const useOrderHistory = (id: string) => useQuery({ queryKey: [...orderKeys.all, "history", id], queryFn: () => getHistory(id), enabled: !!id });
export const useOrderMilestones = (id: string) => useQuery({ queryKey: [...orderKeys.all, "milestones", id], queryFn: () => getMilestones(id), enabled: !!id, retry: false });
