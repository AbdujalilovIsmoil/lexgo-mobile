import { useQuery } from "@tanstack/react-query";
import { useSocketState } from "@/shared/realtime";
import { getCatalog } from "../api/catalogApi";
import { getRequest, listMine } from "../api/clientApi";
import { listAssigned } from "../api/proApi";
import { getQueued, listQueue } from "../api/ccApi";
import { urgentKeys } from "./keys";

// Realtime is the primary refresh; the poll only runs while the user socket is down (TZ 37.6).
const useFallbackMs = (ms: number): number | false => (useSocketState() === "online" ? false : ms);

export const useCatalog = () => useQuery({ queryKey: urgentKeys.catalog, queryFn: getCatalog, staleTime: 5 * 60_000 });
export const useMine = () => useQuery({ queryKey: urgentKeys.mine, queryFn: listMine, refetchInterval: useFallbackMs(30_000) });

export const useAssigned = (f: { kind?: string } = {}) =>
  useQuery({ queryKey: [...urgentKeys.assigned, f.kind ?? ""], queryFn: () => listAssigned(f), refetchInterval: useFallbackMs(30_000) });

// The open pool / the whole call-center queue; the status filter is applied by the server.
export const useQueue = (f: { status?: string; kind?: string; channel?: string } = {}, enabled = true) =>
  useQuery({ queryKey: [...urgentKeys.queue, f.status ?? "", f.kind ?? "", f.channel ?? ""], queryFn: () => listQueue(f), enabled, refetchInterval: useFallbackMs(20_000) });

// "me" reads the participant endpoint (client, assigned advocate); "cc" the call-center one.
export const useRequest = (id: string, scope: "me" | "cc", enabled = true) =>
  useQuery({
    queryKey: [...urgentKeys.detail, scope, id],
    queryFn: () => (scope === "cc" ? getQueued(id) : getRequest(id)),
    enabled: !!id && enabled,
    refetchInterval: useFallbackMs(20_000),
  });
