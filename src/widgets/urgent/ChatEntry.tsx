import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, Icon, PressableScale, Text } from "@/shared/ui";
import { radius } from "@/shared/theme";

type Props = { label: string; who?: string; onPress: () => void };

// The way into the secure chat of a request, as the one card it is: the advocate's avatar (or the chat icon), what it opens
// and with whom, and a round arrow. Teal, so it reads as "talk" next to the blue "join the meeting".
export function ChatEntry({ label, who, onPress }: Props) {
  return (
    <PressableScale onPress={onPress} scale={0.98} accessibilityRole="button" accessibilityLabel={label} style={s.card}>
      <LinearGradient colors={["#00A870", "#0B6E6E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={s.mark} pointerEvents="none"><Icon name="message-circle" size={96} color="rgba(255,255,255,0.12)" /></View>
      {who ? <Avatar name={who} size={46} /> : <View style={s.icon}><Icon name="message-circle" size={22} tone="white" /></View>}
      <View style={s.col}>
        <Text variant="body" weight="bold" tone="white">{label}</Text>
        {who ? <Text variant="small" style={s.dim} numberOfLines={1}>{who}</Text> : null}
      </View>
      <View style={s.go}><Icon name="arrow-right" size={18} color="#0B6E6E" /></View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.rl, overflow: "hidden" },
  mark: { position: "absolute", right: 40, bottom: -28 },
  icon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.22)" },
  col: { flex: 1, gap: 2 },
  dim: { color: "rgba(255,255,255,0.85)" },
  go: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
});
