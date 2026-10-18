import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { getAdminDash, getDrilldown, seedDemoData } from "../api/dashApi";
import { getCeo } from "../api/ceoApi";
import { getCallStats, getQuality } from "../api/insightApi";
import { addWinBack, getRetention } from "../api/retentionApi";
import type { DashFilter, DrillMetric } from "./types";

export const dashKeys = { all: ["admin-dash"] as const };
const key = (name: string, f?: DashFilter) => [...dashKeys.all, name, f?.region ?? "", f?.from ?? "", f?.to ?? ""];
const opts = { retry: false, staleTime: 30_000 } as const;

export const useAdminDashQuery = (f: DashFilter) => useQuery({ queryKey: key("dash", f), queryFn: () => getAdminDash(f), ...opts });
export const useCeoQuery = (f: DashFilter) => useQuery({ queryKey: key("ceo", f), queryFn: () => getCeo(f), ...opts });
export const useQualityQuery = (f: DashFilter) => useQuery({ queryKey: key("quality", f), queryFn: () => getQuality(f), ...opts });
export const useCallsQuery = (f: DashFilter) => useQuery({ queryKey: key("calls", f), queryFn: () => getCallStats(f), ...opts });
export const useRetentionQuery = (f: DashFilter) => useQuery({ queryKey: key("retention", f), queryFn: () => getRetention(f), ...opts });

// Real records behind a metric, loaded when its drill sheet is open.
export const useDrilldown = (metric: DrillMetric | undefined, f: DashFilter) =>
  useQuery({ queryKey: key(`drill-${metric}`, f), queryFn: () => getDrilldown(metric as DrillMetric, f), enabled: !!metric, ...opts });

// Staging-only: fill the platform with showcase records.
export const useSeedDemo = () => useAdminMutation({ mutationFn: seedDemoData, invalidate: [dashKeys.all] });

// Put an at-risk client into the win-back queue.
export const useWinBack = () => useAdminMutation({ mutationFn: addWinBack });
