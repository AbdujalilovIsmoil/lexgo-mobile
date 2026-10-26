import { useQuery } from "@tanstack/react-query";
import { useAccess } from "@/entities/access";
import { useIsAuthed } from "@/entities/session";
import { getCabinet, getOnboarding, getPayouts, getStats } from "../api/cabinetApi";
import type { Cabinet } from "./types";

export const wsKeys = { all: ["pro-workspace"] as const, cabinet: ["pro-workspace", "cabinet"] as const };

function useSeller(): boolean {
  const authed = useIsAuthed();
  const { seller } = useAccess();
  return authed && seller;
}

export const useCabinet = () => useQuery({ queryKey: wsKeys.cabinet, queryFn: getCabinet, enabled: useSeller(), retry: false });
// One request and one cache entry for the cabinet, whoever reads it: another entity takes its part with a stable `select`.
export const useCabinetSlice = <T,>(select: (c: Cabinet) => T) => useQuery({ queryKey: wsKeys.cabinet, queryFn: getCabinet, enabled: useSeller(), retry: false, select });
export const useStats = () => useQuery({ queryKey: [...wsKeys.all, "stats"], queryFn: getStats, enabled: useSeller(), retry: false });
export const useOnboarding = () => useQuery({ queryKey: [...wsKeys.all, "onboarding"], queryFn: getOnboarding, enabled: useSeller(), retry: false });
export const usePayouts = () => useQuery({ queryKey: [...wsKeys.all, "payouts"], queryFn: getPayouts, enabled: useSeller(), retry: false });
