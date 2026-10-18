import { useMemo } from "react";
import { trimSeries, useDashFmt, useDashLabels, useListRow, type DashFilter, type DashOverview, type Drill, type Point } from "@/entities/admin-dash";
import { useT } from "@/shared/i18n";

// Everything a drill builder needs: the loaded payloads, formatters and the derived series.
export function useDashCtx(ov: DashOverview, filter: DashFilter) {
  const { t, locale } = useT();
  const fmt = useDashFmt();
  const label = useDashLabels();
  const toRow = useListRow();
  const { d, c, r, q, demo } = ov;
  return useMemo(() => {
    const chart = (k: string): Point[] => (d?.charts[k] ?? []).filter((x) => x.label);
    const byDesc = (k: string) => chart(k).sort((a, b) => b.value - a.value);
    const region = chart("leads_by_region");
    return {
      t, locale, fmt, label, toRow, filter, demo, d, c, r, q,
      stat: (k: string) => d?.stats[k],
      trend: trimSeries(c?.revenueTrend ?? [], filter),
      funnel: c?.funnel ?? [],
      byStatus: byDesc("orders_by_status"),
      byScore: byDesc("leads_by_score"),
      byRole: chart("sellers_by_role"),
      byRegion: filter.region ? region.filter((x) => x.label === filter.region) : region,
      withDemo: (x: Drill): Drill => ({ ...x, demo }),
    };
  }, [t, locale, fmt, label, toRow, filter, demo, d, c, r, q]);
}
export type DashCtx = ReturnType<typeof useDashCtx>;
