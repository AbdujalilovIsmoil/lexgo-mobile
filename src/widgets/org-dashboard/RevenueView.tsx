import { View } from "react-native";
import { Text } from "@/shared/ui";
import { BarList, SectionCard } from "@/shared/ui/admin";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { WorkRow, type OwnerStats, type WorkItem } from "@/entities/organization";

type Props = { stats: OwnerStats; names: Map<string, string>; onOpen: (w: WorkItem) => void };

// Paid orders: revenue per member and the biggest payments. Counted from the first 500 orders.
export function RevenueView({ stats, names, onOpen }: Props) {
  const { t } = useT();
  const bars = Object.entries(stats.byMember).filter(([, v]) => v.revenue > 0).sort((a, b) => b[1].revenue - a[1].revenue).map(([id, v]) => ({ label: names.get(id) ?? "—", value: v.revenue, hint: t("og2.ordersN", { n: v.orders }) }));
  return (
    <View style={{ gap: 14 }}>
      <Text variant="small" tone="gray">{t(stats.truncated ? "og2.revenueNoteCut" : "og2.revenueNote", { n: stats.sampled })}</Text>
      {bars.length ? <SectionCard title={t("og2.byMember")}><BarList items={bars} format={(n) => `${fmtMoney(n)} ${t("adm.currency")}`} /></SectionCard> : null}
      {stats.paid.slice(0, 20).map((w) => <WorkRow key={w.id} item={w} memberName={names.get(w.memberUserId)} onPress={() => onOpen(w)} />)}
    </View>
  );
}
