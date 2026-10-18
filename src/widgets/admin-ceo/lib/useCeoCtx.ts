import { useMemo } from "react";
import { trimSeries, useDashFmt, useDashLabels, type Ceo, type DashFilter, type Drill } from "@/entities/admin-dash";
import { useT } from "@/shared/i18n";

// Loaded CEO payload + formatters + the trimmed revenue trend, shared by the CEO blocks and their drills.
export function useCeoCtx(c: Ceo | undefined, filter: DashFilter, demo: boolean) {
  const { t } = useT();
  const fmt = useDashFmt();
  const label = useDashLabels();
  return useMemo(() => ({
    t, fmt, label, filter, demo, c,
    trend: trimSeries(c?.revenueTrend ?? [], filter),
    regionHint: filter.region ? t("admDash.hint.regionNa") : undefined,
    withDemo: (x: Drill): Drill => ({ ...x, demo }),
  }), [t, fmt, label, filter, demo, c]);
}
export type CeoCtx = ReturnType<typeof useCeoCtx>;
