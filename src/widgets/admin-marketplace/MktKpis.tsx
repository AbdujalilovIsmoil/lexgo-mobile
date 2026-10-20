import { useState } from "react";
import { ScrollView, StyleSheet, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { TONE_COLOR, type MktStats } from "@/entities/admin-marketplace";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { stats: MktStats; onStatus: (status: string) => void; onSellers: () => void };
type Card = { key: string; icon: IconName; tint: string; value: number; hint?: string; share?: boolean; onPress?: () => void };

const GAP = 12;
const RING = 64;
const STROKE = 8;

// The numbers as a deck of cards you swipe through (one and a bit on screen, all the same size). A card shows the number, its name
// and hint, and — for the order counts — a ring with the share of all orders; dots under the deck show where you are. A card with a
// chevron opens the orders (or sellers) behind the number.
export function MktKpis({ stats: s, onStatus, onSellers }: Props) {
  const { t } = useT();
  const c = useColors();
  const { width } = useWindowDimensions();
  const [at, setAt] = useState(0);
  const w = Math.round((width - 32) * 0.7);
  const k = (key: string) => t(`admMkt.kpi.${key}`);
  const cards: Card[] = [
    { key: "total", icon: "layers", tint: "#3B82F6", value: s.ordersTotal, share: true, onPress: () => onStatus("") },
    { key: "active", icon: "zap", tint: TONE_COLOR.active, value: s.activeOrders, hint: k("activeSub"), share: true },
    { key: "paid", icon: "credit-card", tint: "#06B6D4", value: s.paidOrders, hint: k("paidSub"), share: true, onPress: () => onStatus("paid") },
    { key: "completed", icon: "check-circle", tint: TONE_COLOR.done, value: s.completedOrders, share: true, onPress: () => onStatus("completed") },
    { key: "pending", icon: "clock", tint: TONE_COLOR.pending, value: s.pendingPaymentOrders, share: true, onPress: () => onStatus("pending_payment") },
    { key: "cancelled", icon: "x-circle", tint: TONE_COLOR.cancel, value: s.cancelledOrders, share: true, onPress: () => onStatus("cancelled") },
    { key: "sellers", icon: "users", tint: "#8B5CF6", value: s.sellersCount, hint: k("sellersSub"), onPress: onSellers },
    { key: "clients", icon: "user", tint: "#06B6D4", value: s.clientsCount, hint: k("clientsSub") },
  ];
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setAt(Math.max(0, Math.min(cards.length - 1, Math.round(e.nativeEvent.contentOffset.x / (w + GAP)))));
  return (
    <View style={s2.wrap}>
      <ScrollView horizontal snapToInterval={w + GAP} decelerationRate="fast" showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={32} style={s2.deck} contentContainerStyle={s2.row}>
        {cards.map((x) => {
          const pct = s.ordersTotal ? Math.min(100, Math.round((x.value / s.ordersTotal) * 100)) : 0;
          return (
            <PressableScale key={x.key} onPress={x.onPress} disabled={!x.onPress} accessibilityLabel={`${k(x.key)}: ${x.value}`} style={[s2.card, { width: w, backgroundColor: c.surface, borderColor: `${x.tint}55` }]}>
              <View style={[s2.glow, { backgroundColor: `${x.tint}1F` }]} />
              <View style={s2.left}>
                <View style={s2.head}>
                  <View style={[s2.ic, { backgroundColor: `${x.tint}26` }]}><Icon name={x.icon} size={15} color={x.tint} /></View>
                  <Text variant="small" weight="bold" numberOfLines={1} style={s2.name}>{k(x.key)}</Text>
                  {x.onPress ? <Icon name="chevron-right" size={15} color={c.gray2} /> : null}
                </View>
                <Text variant="h2" numberOfLines={1} adjustsFontSizeToFit style={s2.value}>{x.value}</Text>
                <Text variant="caption" tone="gray2" numberOfLines={1}>{x.hint ?? " "}</Text>
              </View>
              {x.share ? <Ring pct={pct} color={x.tint} track={c.surface2} /> : null}
            </PressableScale>
          );
        })}
      </ScrollView>
      <View style={s2.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {cards.map((x, i) => <View key={x.key} style={[s2.dot, { backgroundColor: i === at ? c.accent : c.line, width: i === at ? 18 : 6 }]} />)}
      </View>
    </View>
  );
}

// Share of all orders: an arc on a track, the percent in the middle.
function Ring({ pct, color, track }: { pct: number; color: string; track: string }) {
  const rect = Skia.XYWHRect(STROKE / 2, STROKE / 2, RING - STROKE, RING - STROKE);
  const full = Skia.PathBuilder.Make().addArc(rect, 0, 359.9).build();
  const arc = Skia.PathBuilder.Make().addArc(rect, -90, Math.max((pct / 100) * 360, pct ? 4 : 0)).build();
  return (
    <View style={s2.ring}>
      <Canvas style={{ width: RING, height: RING }}>
        <Path path={full} style="stroke" strokeWidth={STROKE} color={track} />
        {pct ? <Path path={arc} style="stroke" strokeWidth={STROKE} color={color} strokeCap="round" /> : null}
      </Canvas>
      <View style={StyleSheet.absoluteFill}><View style={s2.mid}><Text variant="caption" weight="bold">{pct}%</Text></View></View>
    </View>
  );
}

const s2 = StyleSheet.create({
  wrap: { gap: 10 },
  deck: { marginHorizontal: -16 },
  row: { paddingHorizontal: 16, gap: GAP },
  card: { height: 132, borderRadius: 24, borderWidth: 1.5, padding: 16, flexDirection: "row", alignItems: "center", gap: 10, overflow: "hidden" },
  glow: { position: "absolute", right: -30, top: -30, width: 110, height: 110, borderRadius: 55 },
  left: { flex: 1, minWidth: 0, gap: 4 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  ic: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  name: { flex: 1 },
  value: { fontSize: 34, lineHeight: 40 },
  ring: { width: RING, height: RING },
  mid: { flex: 1, alignItems: "center", justifyContent: "center" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 5 },
  dot: { height: 6, borderRadius: 3 },
});
