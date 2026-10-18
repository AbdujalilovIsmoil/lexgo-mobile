import { useQuery } from "@tanstack/react-query";
import { usePaged } from "@/shared/lib/usePaged";
import { getOrder, getOverview, listOrders, listSellers } from "../api/marketplaceApi";
import type { MktScope } from "./types";

export const mktKeys = { all: ["admin-marketplace"] as const };

export const useOverview = (scope: MktScope) => useQuery({ queryKey: [...mktKeys.all, "overview", scope], queryFn: () => getOverview(scope) });
export const useOrders = (scope: MktScope, enabled = true) => usePaged([...mktKeys.all, "orders", scope], ({ limit, offset }) => listOrders(scope, limit, offset), { enabled });
export const useSellers = (r: { q: string; dateFrom: string; dateTo: string }, enabled = true) => usePaged([...mktKeys.all, "sellers", r], ({ limit, offset }) => listSellers(r, limit, offset), { enabled });
export const useTopSellers = (dateFrom: string, dateTo: string) =>
  useQuery({ queryKey: [...mktKeys.all, "top", dateFrom, dateTo], queryFn: () => listSellers({ q: "", dateFrom, dateTo }, 6, 0) });
export const useLatestOrders = (scope: MktScope) => useQuery({ queryKey: [...mktKeys.all, "latest", scope], queryFn: () => listOrders(scope, 6, 0) });
export const useOrderDetail = (id: string) => useQuery({ queryKey: [...mktKeys.all, "order", id], queryFn: () => getOrder(id), enabled: !!id });
