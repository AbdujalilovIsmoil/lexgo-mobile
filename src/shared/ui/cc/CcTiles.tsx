import { ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/shared/theme";
import { PressableScale } from "../PressableScale";
import { Text } from "../Text";

export type CcTile = { value: string; label: string; count?: number; alert?: boolean };

// Filter strip made of number tiles (count on top, label under it) instead of plain chips.
export function CcTiles({ options, value, onChange }: { options: CcTile[]; value: string; onChange: (v: string) => void }) {
  const c = useColors();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
      {options.map((o) => {
        const on = o.value === value;
        const body = (
          <>
            {o.count != null ? <Text variant="h3" style={{ color: on ? "#fff" : o.alert && o.count > 0 ? c.err : c.ink }}>{o.count}</Text> : null}
            <Text variant="caption" weight="semibold" numberOfLines={1} style={{ color: on ? "#E6F0FF" : c.gray }}>{o.label}</Text>
          </>
        );
        return (
          <PressableScale key={o.value} onPress={() => onChange(o.value)} scale={0.94} accessibilityRole="button" accessibilityState={{ selected: on }} style={[s.tile, { borderColor: on ? "transparent" : c.line, backgroundColor: on ? undefined : c.surface }]}>
            {on ? <LinearGradient colors={["#1668F0", "#00CFE8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, s.grad]} /> : null}
            {body}
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 8 },
  tile: { minWidth: 82, minHeight: 64, justifyContent: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderWidth: 1.5, overflow: "hidden", gap: 0 },
  grad: { borderRadius: 18 },
});
