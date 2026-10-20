import { ScrollView, StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { TONE_COLOR, type MktStats } from "@/entities/admin-marketplace";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { stats: MktStats; onStatus: (status: string) => void; onSellers: () => void };
type Tile = { key: string; icon: IconName; tint: string; value: number; hint?: string; onPress?: () => void };

// Four headline cards in a 2 x 2 grid (all the same size: tint, icon, big number, name, one-line hint) and a swipeable row of
// four small ones under them. A card with a chevron opens the orders (or sellers) behind the number.
export function MktKpis({ stats: s, onStatus, onSellers }: Props) {
  const { t } = useT();
  const c = useColors();
  const k = (key: string) => t(`admMkt.kpi.${key}`);
  const main: Tile[] = [
    { key: "total", icon: "layers", tint: "#3B82F6", value: s.ordersTotal, onPress: () => onStatus("") },
    { key: "active", icon: "zap", tint: TONE_COLOR.active, value: s.activeOrders, hint: k("activeSub") },
    { key: "paid", icon: "credit-card", tint: "#06B6D4", value: s.paidOrders, hint: k("paidSub"), onPress: () => onStatus("paid") },
    { key: "completed", icon: "check-circle", tint: TONE_COLOR.done, value: s.completedOrders, onPress: () => onStatus("completed") },
  ];
  const rest: Tile[] = [
    { key: "pending", icon: "clock", tint: TONE_COLOR.pending, value: s.pendingPaymentOrders, onPress: () => onStatus("pending_payment") },
    { key: "cancelled", icon: "x-circle", tint: TONE_COLOR.cancel, value: s.cancelledOrders, onPress: () => onStatus("cancelled") },
    { key: "sellers", icon: "users", tint: "#8B5CF6", value: s.sellersCount, onPress: onSellers },
    { key: "clients", icon: "user", tint: "#06B6D4", value: s.clientsCount },
  ];
  return (
    <View style={s2.wrap}>
      <View style={s2.grid}>
        {main.map((x) => (
          <PressableScale key={x.key} onPress={x.onPress} disabled={!x.onPress} accessibilityLabel={`${k(x.key)}: ${x.value}`} style={[s2.big, { backgroundColor: `${x.tint}14`, borderColor: `${x.tint}38` }]}>
            <View style={s2.top}>
              <View style={[s2.ic, { backgroundColor: `${x.tint}26` }]}><Icon name={x.icon} size={18} color={x.tint} /></View>
              {x.onPress ? <Icon name="chevron-right" size={16} color={c.gray2} /> : null}
            </View>
            <Text variant="h2" numberOfLines={1} adjustsFontSizeToFit>{x.value}</Text>
            <View>
              <Text variant="small" weight="bold" numberOfLines={1}>{k(x.key)}</Text>
              <Text variant="caption" tone="gray2" numberOfLines={1}>{x.hint ?? " "}</Text>
            </View>
          </PressableScale>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s2.rail} style={s2.railBox}>
        {rest.map((x) => (
          <PressableScale key={x.key} onPress={x.onPress} disabled={!x.onPress} accessibilityLabel={`${k(x.key)}: ${x.value}`} style={[s2.small, { backgroundColor: c.surface, borderColor: c.line }]}>
            <View style={[s2.dot, { backgroundColor: `${x.tint}26` }]}><Icon name={x.icon} size={16} color={x.tint} /></View>
            <View style={s2.fill}>
              <Text variant="body" weight="bold" numberOfLines={1}>{x.value}</Text>
              <Text variant="caption" tone="gray" numberOfLines={1}>{k(x.key)}</Text>
            </View>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  );
}

const s2 = StyleSheet.create({
  wrap: { gap: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  big: { width: "48.5%", height: 124, borderRadius: 20, borderWidth: 1, padding: 14, justifyContent: "space-between" },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ic: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  railBox: { marginHorizontal: -16 },
  rail: { paddingHorizontal: 16, gap: 10 },
  small: { width: 150, height: 62, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1 },
  dot: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  fill: { flex: 1 },
});
