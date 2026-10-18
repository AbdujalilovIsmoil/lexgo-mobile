import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAudit, listSecurityEvents } from "../api/auditApi";
import { chainOf } from "./chain";
import type { AuditFilters } from "./types";

export const auditKeys = { all: ["admin-audit"] as const };

export const useAuditTrail = (f: AuditFilters) => useQuery({ queryKey: [...auditKeys.all, "log", f], queryFn: () => listAudit(f) });
export const useSecurityEvents = (status: string) => useQuery({ queryKey: [...auditKeys.all, "events", status], queryFn: () => listSecurityEvents(status) });

// The endpoints return the whole list at once: show it a screenful at a time, and give
// PagedList the "show more" hooks it expects.
export function useShown<T>(all: T[], q: { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown; isRefetching: boolean }, step = 30) {
  const [n, setN] = useState(step);
  const query = { isLoading: q.isLoading, isError: q.isError, error: q.error, refetch: q.refetch, isRefetching: q.isRefetching, hasNextPage: all.length > n, fetchNextPage: () => setN((x) => x + step), isFetchingNextPage: false };
  return { items: all.slice(0, n), query };
}

export const useChain = (rows: Parameters<typeof chainOf>[0]) => useMemo(() => chainOf(rows), [rows]);
