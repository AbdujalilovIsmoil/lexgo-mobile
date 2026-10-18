import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import type { CallsCtx } from "../useCallsCtx";

type Agent = CallsCtx["a"]["topAgents"][number];
const MEDAL = ["#F59E0B", "#94A3B8", "#C2680A"];

// The busiest agents: a podium for the top three (1st in the middle, tallest) and bars for everyone after them.
export function Podium({ x }: { x: CallsCtx }) {
  const { t, a } = x;
  const list = a.topAgents;
  const top = Math.max(1, ...list.map((g) => g.calls));
  if (!list.length) return <SectionCard title={t("admCalls.topAgents")}><Text variant="small" tone="gray">{t("admCalls.noAgents")}</Text></SectionCard>;
  const order = [list[1], list[0], list[2]].map((g, i) => (g ? { g, rank: [1, 0, 2][i] } : null));
  return (
    <SectionCard title={t("admCalls.topAgents")}>
      <View style={s.podium}>
        {order.map((o, i) => o ? (
          <Animated.View key={o.g.name + i} entering={FadeInUp.delay(o.rank * 120).duration(380)} style={s.slot}>
            <Avatar name={o.g.name} size={o.rank === 0 ? 54 : 44} />
            <Text variant="caption" weight="bold" numberOfLines={1} center>{o.g.name}</Text>
            <LinearGradient colors={[MEDAL[o.rank], `${MEDAL[o.rank]}66`]} style={[s.step, { height: 34 + (o.g.calls / top) * 56 }]}>
              <Text variant="h4" tone="white">{o.g.calls}</Text>
              <Text variant="caption" tone="white">#{o.rank + 1}</Text>
            </LinearGradient>
          </Animated.View>
        ) : <View key={i} style={s.slot} />)}
      </View>
      {list.slice(3).map((g: Agent, i) => (
        <View key={`${g.name}-${i}`} style={s.line}>
          <Text variant="small" weight="bold" style={s.n}>{i + 4}</Text>
          <Text variant="small" numberOfLines={1} style={s.nm}>{g.name}</Text>
          <View style={s.track}><View style={[s.fillBar, { width: `${(g.calls / top) * 100}%` }]} /></View>
          <Text variant="small" weight="bold">{g.calls}</Text>
        </View>
      ))}
    </SectionCard>
  );
}

const s = StyleSheet.create({
  podium: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 6 },
  slot: { flex: 1, alignItems: "center", gap: 6, justifyContent: "flex-end" },
  step: { width: "100%", borderTopLeftRadius: 14, borderTopRightRadius: 14, alignItems: "center", justifyContent: "center", gap: 0 },
  line: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  n: { width: 18 },
  nm: { flex: 1.2 },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: "rgba(128,140,160,0.2)", overflow: "hidden" },
  fillBar: { height: 8, borderRadius: 4, backgroundColor: "#3B82F6" },
});
