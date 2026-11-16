import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, PressableScale, Text } from "@/shared/ui";

type Props = { title: string; sub: string; onPress: () => void };

// The main way to get help, in the Home band's look: the navy gradient card with the faint rings in the corner, a glassy headset tile,
// white title, light-blue line and a white round arrow.
export function OperatorCard({ title, sub, onPress }: Props) {
  return (
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="menuitem" accessibilityLabel={title}>
      <LinearGradient colors={["#13357A", "#0A1F44", "#0A1F44"]} locations={[0, 0.65, 1]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={s.card}>
        <View style={s.halo} pointerEvents="none" />
        <View style={s.ring} pointerEvents="none" />
        <View style={s.badge}>
          <Icon name="headphones" size={22} tone="white" />
          <View style={s.live} />
        </View>
        <View style={s.tx}>
          <Text variant="h4" tone="white" numberOfLines={1} style={s.title}>{title}</Text>
          <Text variant="caption" numberOfLines={2} style={s.sub}>{sub}</Text>
        </View>
        <View style={s.go}><Icon name="arrow-right" size={17} color="#0A1F44" /></View>
      </LinearGradient>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 18, overflow: "hidden" },
  halo: { position: "absolute", right: -70, top: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.03)" },
  ring: { position: "absolute", right: -50, top: -40, width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: "rgba(255,255,255,0.09)" },
  badge: { width: 46, height: 46, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  live: { position: "absolute", top: -3, right: -3, width: 12, height: 12, borderRadius: 6, backgroundColor: "#3DDC97", borderWidth: 2, borderColor: "#0F2A5E" },
  tx: { flex: 1, gap: 2 },
  title: { fontSize: 15.5, lineHeight: 20 },
  sub: { color: "#AFC0E0", fontSize: 12, lineHeight: 16 },
  go: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
});
