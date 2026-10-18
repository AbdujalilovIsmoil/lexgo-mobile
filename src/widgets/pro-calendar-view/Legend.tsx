import { ScrollView, StyleSheet, View } from "react-native";
import { EVENT_TYPES, tintOf } from "@/entities/pro-calendar";
import { tOr } from "@/shared/lib/pro/tOr";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// What each dot colour on the grid means: the five event types, one small chip each (scrolls sideways when they do not fit).
export function Legend() {
  const { t } = useT();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.rail} contentContainerStyle={s.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {EVENT_TYPES.map((k) => (
        <View key={k} style={s.item}><View style={[s.dot, { backgroundColor: tintOf(k) }]} /><Text variant="caption" tone="gray">{tOr(t, `aw11.eventType.${k}`, k)}</Text></View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({ rail: { marginHorizontal: -16, flexGrow: 0 }, row: { gap: 14, paddingHorizontal: 16 }, item: { flexDirection: "row", alignItems: "center", gap: 6 }, dot: { width: 8, height: 8, borderRadius: 4 } });
