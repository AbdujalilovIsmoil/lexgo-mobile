import { useMemo } from "react";
import { useDashFmt, useDashLabels, type DashFilter, type Retention } from "@/entities/admin-dash";
import { useT } from "@/shared/i18n";

const EMPTY: Retention = { atRisk: 0, atRiskLeads: 0, churnedThisMonth: 0, retainedPct: 0, previousPeriodActive: 0, currentPeriodActive: 0, retainedClients: 0, atRiskClients: [], upsell: [] };

export function useRetentionCtx(data: Retention | undefined, filter: DashFilter, demo: boolean) {
  const { t, locale } = useT();
  const fmt = useDashFmt();
  const label = useDashLabels();
  return useMemo(() => ({
    t, locale, fmt, label, demo, d: data ?? EMPTY,
    regionHint: filter.region ? t("admDash.hint.regionNa") : undefined,
  }), [t, locale, fmt, label, demo, data, filter.region]);
}
export type RetCtx = ReturnType<typeof useRetentionCtx>;
