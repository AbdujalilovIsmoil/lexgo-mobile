import { KpiGrid, KpiTile } from "@/shared/ui/admin";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { Dashboard, OwnerStats } from "@/entities/organization";
import { KPI_ICON, KPI_TINT, overdueOf, type KpiKind } from "./kpis";

type Props = { dash: Dashboard; stats: OwnerStats | undefined; loadingStats: boolean; onOpen: (k: KpiKind) => void };
const DASH = "—";

// Seven headline numbers; each opens a drawer with the records behind it.
export function DashKpis({ dash, stats, loadingStats, onOpen }: Props) {
  const { t } = useT();
  const s = dash.summary;
  const tile = (k: KpiKind, value: string, hint?: string, loading = false) => (
    <KpiTile key={k} icon={KPI_ICON[k]} tint={KPI_TINT[k]} label={t(`og2.kpi.${k}`)} value={value} hint={hint} loading={loading} onPress={() => onOpen(k)} />
  );
  const approx = stats?.truncated ? "≈ " : "";
  return (
    <KpiGrid>
      {tile("members", String(s.members), t("og2.verifiedN", { n: s.verified }))}
      {tile("orders", String(s.orders))}
      {tile("cases", String(s.cases))}
      {tile("urgent", String(s.urgent))}
      {tile("overdue", String(overdueOf(dash).length))}
      {tile("completed", stats ? `${approx}${stats.completed}` : DASH, stats ? t("og2.ofN", { n: stats.orders }) : undefined, loadingStats)}
      {tile("revenue", stats ? `${approx}${fmtMoney(stats.revenue)}` : DASH, t("og2.paidOrders"), loadingStats)}
    </KpiGrid>
  );
}
