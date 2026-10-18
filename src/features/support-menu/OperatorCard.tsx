import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, PressableScale, Text } from "@/shared/ui";

type Props = { title: string; sub: string; onPress: () => void };

// The main way to get help: a full-width blue gradient card with a big faded headset behind the text.
export function OperatorCard({ title, sub, onPress }: Props) {
  return (
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="menuitem" accessibilityLabel={title}>
      <LinearGradient colors={["#1668F0", "#00A6E6", "#00CFE8"]} locations={[0, 0.62, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
        <View style={s.ghost} pointerEvents="none"><Icon name="headphones" size={120} color="rgba(255,255,255,0.14)" /></View>
        <View style={s.badge}><Icon name="headphones" size={22} tone="white" /></View>
        <View style={s.tx}>
          <Text variant="body" weight="bold" tone="white">{title}</Text>
          <Text variant="small" style={s.sub}>{sub}</Text>
        </View>
        <View style={s.go}><Icon name="arrow-right" size={18} color="#1668F0" /></View>
      </LinearGradient>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 22, overflow: "hidden" },
  ghost: { position: "absolute", right: -18, bottom: -26 },
  badge: { width: 46, height: 46, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
  tx: { flex: 1, gap: 2 },
  sub: { color: "rgba(255,255,255,0.85)" },
  go: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
});
