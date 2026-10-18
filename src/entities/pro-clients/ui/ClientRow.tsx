import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useT } from "@/shared/i18n";
import { fmtDate, initials } from "@/shared/lib/format";
import { gradient, radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import type { ProClient } from "../model/types";

// One client as a card: a gradient monogram (green dot while they have active cases, amber when a conflict was found), the name,
// the phone, three small counters (cases · orders · active) and the date of the last activity; a conflict gets its own strip.
export function ClientRow({ client, onPress, index = 0 }: { client: ProClient; onPress: () => void; index?: number }) {
  const { t, locale } = useT();
  const c = useColors();
  const active = client.activeCaseIds.length;
  const stats = [
    { icon: "briefcase" as const, n: client.casesCount, label: t("cln.casesN") },
    { icon: "shopping-bag" as const, n: client.ordersCount, label: t("cln.ordersN") },
    { icon: "activity" as const, n: active, label: t("cln.activeN"), on: active > 0 },
  ];
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(260)}>
      <PressableScale onPress={onPress} scale={0.985} accessibilityRole="button" accessibilityLabel={`${client.name}. ${client.phone}`} style={[s.card, { backgroundColor: c.surface, borderColor: client.hasConflict ? c.warn : c.line }]}>
        <View style={s.top}>
          <View>
            <LinearGradient colors={[...gradient.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.avatar}><Text variant="h4" tone="white">{initials(client.name) || "?"}</Text></LinearGradient>
            {active || client.hasConflict ? <View style={[s.dot, { backgroundColor: client.hasConflict ? c.warn : c.ok, borderColor: c.surface }]} /> : null}
          </View>
          <View style={s.who}>
            <Text variant="body" weight="bold" numberOfLines={1}>{client.name || "—"}</Text>
            {client.phone ? <View style={s.line}><Icon name="phone" size={12} tone="gray" /><Text variant="caption" tone="gray" numberOfLines={1}>{client.phone}</Text></View> : null}
            {client.lastActiveAt ? <Text variant="caption" tone="gray2">{fmtDate(client.lastActiveAt, locale)}</Text> : null}
          </View>
          <Icon name="chevron-right" size={18} color={c.gray2} />
        </View>
        <View style={s.stats}>
          {stats.map((x) => (
            <View key={x.label} style={[s.stat, { backgroundColor: x.on ? c.okBg : c.surface2 }]}>
              <Icon name={x.icon} size={13} color={x.on ? c.ok : c.gray} />
              <Text variant="small" weight="bold" style={x.on ? { color: c.ok } : undefined}>{x.n}</Text>
              <Text variant="caption" tone="gray" numberOfLines={1} style={s.sl}>{x.label}</Text>
            </View>
          ))}
        </View>
        {client.hasConflict ? <View style={[s.warn, { backgroundColor: c.warnBg }]}><Icon name="alert-triangle" size={14} color={c.warn} /><Text variant="caption" weight="bold" style={{ color: c.warn }}>{t("aw3.conflict")}</Text></View> : null}
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { gap: 12, padding: 14, borderRadius: radius.rl, borderWidth: 1 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", right: -3, bottom: -3, width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  who: { flex: 1, gap: 2 },
  line: { flexDirection: "row", alignItems: "center", gap: 5 },
  stats: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12 },
  sl: { flexShrink: 1 },
  warn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12 },
});
