import { StyleSheet, View } from "react-native";
import { EVENT_TYPES, tintOf } from "@/entities/pro-calendar";
import { tOr } from "@/shared/lib/pro/tOr";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// What each dot colour on the grid means: the five event types, wrapped onto as many lines as they need (all of them always in view).
export function Legend() {
  const { t } = useT();
  return (
    <View style={s.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {EVENT_TYPES.map((k) => (
        <View key={k} style={s.item}><View style={[s.dot, { backgroundColor: tintOf(k) }]} /><Text variant="caption" tone="gray">{tOr(t, `aw11.eventType.${k}`, k)}</Text></View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", flexWrap: "wrap", columnGap: 14, rowGap: 6 }, item: { flexDirection: "row", alignItems: "center", gap: 6 }, dot: { width: 8, height: 8, borderRadius: 4 } });
