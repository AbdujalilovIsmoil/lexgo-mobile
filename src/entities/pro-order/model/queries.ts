import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { acceptOrder, declineOrder, getHistory, getMilestones, listOrders, moveOrder } from "../api/orderApi";

export const orderKeys = { all: ["pro-order"] as const };

export const useProOrders = () => useQuery({ queryKey: [...orderKeys.all, "list"], queryFn: listOrders });
export const useOrderHistory = (id: string) => useQuery({ queryKey: [...orderKeys.all, "history", id], queryFn: () => getHistory(id), enabled: !!id });
export const useOrderMilestones = (id: string) => useQuery({ queryKey: [...orderKeys.all, "milestones", id], queryFn: () => getMilestones(id), enabled: !!id, retry: false });

const inv = [orderKeys.all];
export const useAcceptOrder = () => useAdminMutation({ mutationFn: acceptOrder, invalidate: inv, success: "sl9.done.accepted" });
export const useDeclineOrder = (onDone?: () => void) =>
  useAdminMutation({ mutationFn: (v: { id: string; reason: string; note: string }) => declineOrder(v.id, v.reason, v.note), invalidate: inv, success: "sl9.done.declined", onSuccess: onDone });
export const useMoveOrder = () =>
  useAdminMutation({ mutationFn: (v: { id: string; status: string; note: string }) => moveOrder(v.id, v.status, v.note), invalidate: inv, success: "sl9.done.moved" });
