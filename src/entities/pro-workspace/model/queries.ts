import { useQuery } from "@tanstack/react-query";
import { useAccess } from "@/entities/access";
import { useIsAuthed } from "@/entities/session";
import { getCabinet, getOnboarding, getPayouts, getStats } from "../api/cabinetApi";

export const wsKeys = { all: ["pro-workspace"] as const };

function useSeller(): boolean {
  const authed = useIsAuthed();
  const { seller } = useAccess();
  return authed && seller;
}

export const useCabinet = () => useQuery({ queryKey: [...wsKeys.all, "cabinet"], queryFn: getCabinet, enabled: useSeller(), retry: false });
export const useStats = () => useQuery({ queryKey: [...wsKeys.all, "stats"], queryFn: getStats, enabled: useSeller(), retry: false });
export const useOnboarding = () => useQuery({ queryKey: [...wsKeys.all, "onboarding"], queryFn: getOnboarding, enabled: useSeller(), retry: false });
export const usePayouts = () => useQuery({ queryKey: [...wsKeys.all, "payouts"], queryFn: getPayouts, enabled: useSeller(), retry: false });
