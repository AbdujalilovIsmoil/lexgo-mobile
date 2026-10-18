import { StyleSheet, View } from "react-native";
import { Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";

// The pill at the top of a room (web: "Xabarlar filtrlanadi va uchdan-uchgacha himoyalangan"): a lock tile and the line.
export function SecureNote({ text }: { text: string }) {
  const c = useColors();
  return (
    <View style={[s.box, { backgroundColor: c.tint, borderColor: c.line }]}>
      <View style={[s.tile, { backgroundColor: c.tint2 }]}><Icon name="lock" size={14} color={c.accent} /></View>
      <Text variant="caption" weight="semibold" tone="accent" style={s.t}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 14, marginTop: 10, padding: 8, borderRadius: 18, borderWidth: 1 },
  tile: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  t: { flex: 1 },
});
