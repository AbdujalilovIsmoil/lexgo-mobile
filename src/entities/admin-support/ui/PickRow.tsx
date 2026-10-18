import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";

type Props = { title: string; hint?: string; right?: string; selected?: boolean; onPress: () => void };

// A selectable row inside a form sheet (operator, seller, service, document base …).
export function PickRow({ title, hint, right, selected, onPress }: Props) {
  const c = useColors();
  return (
    <PressableScale onPress={onPress} style={[s.row, { borderColor: selected ? c.accent : c.line, backgroundColor: selected ? c.tint : c.surface }]}>
      <View style={s.col}>
        <Text variant="body" weight="semibold" numberOfLines={2}>{title}</Text>
        {hint ? <Text variant="caption" tone="gray" numberOfLines={2}>{hint}</Text> : null}
      </View>
      {right ? <Text variant="small" weight="bold" tone="accent">{right}</Text> : null}
      {selected ? <Icon name="check-circle" size={18} tone="accent" /> : null}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 13, borderRadius: 14, borderWidth: 1.5 },
  col: { flex: 1, gap: 2 },
});
