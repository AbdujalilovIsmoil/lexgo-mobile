import { View } from "react-native";
import { Avatar, PressableScale, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useMktLabels, type MktSeller } from "@/entities/admin-marketplace";
import { fmtMoney } from "@/shared/lib/money";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { sellers: MktSeller[]; onSeller: (s: MktSeller) => void; onAll: () => void };

// Seller workload ranking (by active jobs); a tap shows that seller's orders.
export function TopSellers({ sellers, onSeller, onAll }: Props) {
  const { t } = useT();
  const c = useColors();
  const label = useMktLabels();
  const rows = sellers.filter((s) => s.ordersTotal > 0 || s.activeOrders > 0).slice(0, 6);
  const max = Math.max(1, ...rows.map((s) => s.activeOrders));
  return (
    <SectionCard title={t("admMkt.top.title")} action={{ label: t("admMkt.top.all"), onPress: onAll }}>
      <Text variant="caption" tone="gray">{t("admMkt.top.lead")}</Text>
      {rows.length ? rows.map((s, i) => (
        <PressableScale key={s.userId} onPress={() => onSeller(s)} style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text variant="small" tone="gray" weight="bold" style={{ width: 16 }}>{i + 1}</Text>
            <Avatar name={s.name || s.phone || "?"} size={34} />
            <View style={{ flex: 1 }}>
              <Text variant="small" weight="bold" numberOfLines={1}>{s.name || s.phone || "—"}</Text>
              <Text variant="caption" tone="gray" numberOfLines={1}>{label.type(s.sellerType)} · {t("admMkt.top.meta", { done: s.completedOrders, total: s.ordersTotal })} · {fmtMoney(s.revenuePaid)}</Text>
            </View>
            <Text variant="body" weight="bold">{s.activeOrders}</Text>
          </View>
          <View style={{ height: 5, borderRadius: 3, backgroundColor: c.surface2 }}><View style={{ height: 5, borderRadius: 3, width: `${(s.activeOrders / max) * 100}%`, backgroundColor: c.accent }} /></View>
        </PressableScale>
      )) : <Text variant="small" tone="gray">{t("admMkt.top.empty")}</Text>}
    </SectionCard>
  );
}
