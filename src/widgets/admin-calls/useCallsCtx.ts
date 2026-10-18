import { useMemo } from "react";
import { trimSeries, useDashFmt, type CallStats, type DashFilter } from "@/entities/admin-dash";
import { useT } from "@/shared/i18n";

const EMPTY: CallStats = { total: 0, answered: 0, missed: 0, avgDurationSec: 0, byDay: [], topAgents: [] };

// Call statistics with the day series cut to the chosen period and the derived answer rate.
export function useCallsCtx(data: CallStats | undefined, filter: DashFilter, demo: boolean) {
  const { t } = useT();
  const fmt = useDashFmt();
  return useMemo(() => {
    const a = data ?? EMPTY;
    return {
      t, fmt, demo, filter, a,
      byDay: trimSeries(a.byDay, filter),
      rate: a.total ? Math.round((a.answered / a.total) * 100) : 0,
      regionHint: filter.region ? t("admDash.hint.regionNa") : undefined,
    };
  }, [t, fmt, demo, filter, data]);
}
export type CallsCtx = ReturnType<typeof useCallsCtx>;
