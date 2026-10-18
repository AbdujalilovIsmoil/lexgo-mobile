import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { hintOf, OrderStatusPill, stageOf, type ProOrder } from "@/entities/pro-order";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";

// One order of the seller: stage-coloured edge, service, client and work id, price / date chips, the status pill and — when the seller
// has to act — what to do next.
export function OrderCard({ order: o, onPress }: { order: ProOrder; onPress: () => void }) {
  const { t, locale } = useT();
  const c = useColors();
  const stage = stageOf(o);
  const edge = { new: c.accent, active: "#06B6D4", completed: c.ok, cancelled: c.err, unpaid: c.gray }[stage];
  const hint = hintOf(o);
  const who = [o.buyerName, o.workId].filter(Boolean).join(" · ");
  return (
    <Animated.View entering={FadeIn.duration(260)}>
      <PressableScale scale={0.99} onPress={onPress} accessibilityRole="button" accessibilityLabel={o.serviceTitle || o.workId} style={[s.card, { backgroundColor: c.surface, borderColor: c.line }]}>
        <View style={[s.edge, { backgroundColor: edge }]} />
        <View style={s.body}>
          <View style={s.head}>
            <Text variant="body" weight="bold" numberOfLines={2} style={s.flex}>{o.serviceTitle || o.workId}</Text>
            <OrderStatusPill status={o.status} />
          </View>
          {who ? <View style={s.chip}><Icon name="user" size={13} tone="gray" /><Text variant="small" tone="gray" numberOfLines={1} style={s.flex}>{who}</Text></View> : null}
          <View style={s.chips}>
            <View style={[s.pill, { backgroundColor: o.price ? `${c.ok}22` : c.surface2 }]}>
              <Icon name="credit-card" size={13} color={o.price ? c.ok : c.gray} />
              <Text variant="small" weight="bold" style={{ color: o.price ? c.ok : c.gray }}>{o.price ? `${fmtMoney(o.price)} ${t("common.currency")}` : t("pof.noPrice")}</Text>
            </View>
            {o.createdAt ? <View style={s.chip}><Icon name="clock" size={13} tone="gray" /><Text variant="caption" tone="gray">{fmtDateTime(o.createdAt, locale)}</Text></View> : null}
          </View>
          {hint ? <View style={[s.hint, { backgroundColor: hint === "paused" ? c.warnBg : c.tint2 }]}><Icon name={hint === "paused" ? "pause-circle" : "zap"} size={14} color={hint === "paused" ? c.warn : c.accent} /><Text variant="small" weight="semibold" style={[s.flex, { color: hint === "paused" ? c.warn : c.accentStrong }]}>{t(`pof.hint${hint[0].toUpperCase()}${hint.slice(1)}`)}</Text></View> : null}
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", borderRadius: radius.rl, borderWidth: 1, overflow: "hidden", minHeight: 44 },
  edge: { width: 5 },
  body: { flex: 1, gap: 10, padding: 14 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4 },
  hint: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 12 },
});
