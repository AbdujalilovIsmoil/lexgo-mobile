import { useQuery } from "@tanstack/react-query";
import { useFallbackInterval } from "@/shared/lib/adm/useFallbackInterval";
import { getMonitoring, listApprovals, listGrants, listRoutes } from "../api/adminApi";
import { listComments, listReference } from "../api/extraApi";
import { checkPayload } from "../api/checkApi";
import { getObject } from "../api/objectApi";
import type { StudioPayload } from "./types";
import { getConstructor, listConstructors } from "../api/registryApi";
import { getFormContext } from "../api/recordsApi";

export const studioKeys = { all: ["admin-studio"] as const };
const K = studioKeys.all;
const FIVE_MIN = 5 * 60_000;

export const useRegistry = () => useQuery({ queryKey: [...K, "registry"], queryFn: listConstructors, staleTime: FIVE_MIN });
export const useConstructor = (code: string) => useQuery({ queryKey: [...K, "ctor", code], queryFn: () => getConstructor(code), enabled: !!code, staleTime: FIVE_MIN });
// Refetched when a studio.* event arrives (useStudioSync); a 20 s poll only while the socket is down. The editor decides what to do with a newer copy.
export function useObject(id: string) {
  const every = useFallbackInterval(20_000);
  return useQuery({ queryKey: [...K, "object", id], queryFn: () => getObject(id), enabled: !!id, refetchInterval: every, staleTime: 0 });
}
export const useComments = (id: string) => useQuery({ queryKey: [...K, "comments", id], queryFn: () => listComments(id), enabled: !!id });
export function useApprovals(code: string, status: string) {
  const every = useFallbackInterval(30_000);
  return useQuery({ queryKey: [...K, "approvals", code, status], queryFn: () => listApprovals({ code, status }), refetchInterval: every });
}
export const useGrants = () => useQuery({ queryKey: [...K, "grants"], queryFn: listGrants });
export const useRoutes = () => useQuery({ queryKey: [...K, "routes"], queryFn: listRoutes });
export const useReference = (key: string, q: string, enabled = true) => useQuery({ queryKey: [...K, "ref", key, q], queryFn: () => listReference(key, q), enabled: enabled && !!key, staleTime: FIVE_MIN });
export function useMonitoring(p: { code: string; userId: string; from: string; to: string }) {
  const every = useFallbackInterval(30_000);
  return useQuery({ queryKey: [...K, "monitoring", p], queryFn: () => getMonitoring(p), refetchInterval: every });
}
// Server-side validation + dry-run preview of a draft; runs when `enabled` (the sheet is open), never cached.
export const useServerCheck = (code: string, payload: StudioPayload, enabled: boolean) =>
  useQuery({ queryKey: [...K, "check", code, JSON.stringify(payload)], queryFn: () => checkPayload(code, payload), enabled: enabled && !!code, staleTime: 0, gcTime: 0, retry: false });
// Seed of a new draft from a published record (edit/clone) — only when `record` is set.
export const useFormContext = (code: string, mode: string, record: string, source: string) =>
  useQuery({ queryKey: [...K, "form-ctx", code, mode, record, source], queryFn: () => getFormContext(code, mode, record, source), enabled: !!code && !!record, staleTime: 0, gcTime: 0 });
