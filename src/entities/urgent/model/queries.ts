import { useQuery } from "@tanstack/react-query";
import { useSocketState } from "@/shared/realtime";
import { getCatalog } from "../api/catalogApi";
import { getRequest, listMine } from "../api/clientApi";
import { listAssigned } from "../api/proApi";
import { urgentKeys } from "./keys";

// Realtime is the primary refresh; the poll only runs while the user socket is down (TZ 37.6).
const useFallbackMs = (ms: number): number | false => (useSocketState() === "online" ? false : ms);

export const useCatalog = () => useQuery({ queryKey: urgentKeys.catalog, queryFn: getCatalog, staleTime: 5 * 60_000 });
export const useMine = () => useQuery({ queryKey: urgentKeys.mine, queryFn: listMine, refetchInterval: useFallbackMs(30_000) });

export const useAssigned = (f: { kind?: string } = {}) =>
  useQuery({ queryKey: [...urgentKeys.assigned, f.kind ?? ""], queryFn: () => listAssigned(f), refetchInterval: useFallbackMs(30_000) });

// The participant endpoint (the client, the assigned advocate).
export const useRequest = (id: string, enabled = true) =>
  useQuery({
    queryKey: [...urgentKeys.detail, id],
    queryFn: () => getRequest(id),
    enabled: !!id && enabled,
    refetchInterval: useFallbackMs(20_000),
  });
