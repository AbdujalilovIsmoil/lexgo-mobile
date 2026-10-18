import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";

// Check-bulleted feature list: exactly what the backend sent, never inferred from the plan name.
export function PlanFeatures({ items, limit }: { items: string[]; limit?: number }) {
  const c = useColors();
  return (
    <View style={s.col}>
      {(limit ? items.slice(0, limit) : items).map((f, i) => (
        <View key={i} style={s.feature}>
          <View style={[s.tick, { backgroundColor: c.okBg }]}><Icon name="check" size={12} color={c.ok} /></View>
          <Text variant="small" style={s.text}>{f}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  feature: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  tick: { width: 20, height: 20, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", marginTop: 1 },
  text: { flex: 1 },
});
