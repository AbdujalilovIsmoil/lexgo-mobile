import { KpiGrid, KpiTile } from "@/shared/ui/admin";
import { TONE_COLOR, type MktStats } from "@/entities/admin-marketplace";
import { useT } from "@/shared/i18n";

type Props = { stats: MktStats; onStatus: (status: string) => void; onSellers: () => void };

// Eight KPI tiles; the status ones open the Orders tab filtered by that status.
export function StatsKpis({ stats: s, onStatus, onSellers }: Props) {
  const { t } = useT();
  const k = (key: string) => t(`admMkt.kpi.${key}`);
  return (
    <KpiGrid>
      <KpiTile icon="layers" label={k("total")} value={String(s.ordersTotal)} onPress={() => onStatus("")} />
      <KpiTile icon="zap" tint={TONE_COLOR.active} label={k("active")} value={String(s.activeOrders)} hint={k("activeSub")} />
      <KpiTile icon="credit-card" label={k("paid")} value={String(s.paidOrders)} hint={k("paidSub")} onPress={() => onStatus("paid")} />
      <KpiTile icon="check-circle" tint={TONE_COLOR.done} label={k("completed")} value={String(s.completedOrders)} onPress={() => onStatus("completed")} />
      <KpiTile icon="clock" tint={TONE_COLOR.pending} label={k("pending")} value={String(s.pendingPaymentOrders)} onPress={() => onStatus("pending_payment")} />
      <KpiTile icon="x-circle" tint={TONE_COLOR.cancel} label={k("cancelled")} value={String(s.cancelledOrders)} onPress={() => onStatus("cancelled")} />
      <KpiTile icon="users" tint="#8B5CF6" label={k("sellers")} value={String(s.sellersCount)} hint={k("sellersSub")} onPress={onSellers} />
      <KpiTile icon="user" tint="#06B6D4" label={k("clients")} value={String(s.clientsCount)} hint={k("clientsSub")} />
    </KpiGrid>
  );
}
