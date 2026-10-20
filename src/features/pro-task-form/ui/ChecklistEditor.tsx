import { StyleSheet, View } from "react-native";
import type { CheckItem } from "@/entities/pro-tasks";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { Icon, Input, PressableScale, Text } from "@/shared/ui";

type Props = { items: CheckItem[]; onChange: (v: CheckItem[]) => void; text: string; onText: (v: string) => void; onFocus?: () => void };

// Checklist inside the task form: tick, remove, and an add row (field + button) that keeps the keyboard open for the next item.
export function ChecklistEditor({ items, onChange, text, onText, onFocus }: Props) {
  const { t } = useT();
  const c = useColors();
  const add = () => {
    if (!text.trim()) return;
    onChange([...items, { text: text.trim(), done: false }]);
    onText("");
  };
  const patch = (i: number, p: Partial<CheckItem>) => onChange(items.map((x, j) => (j === i ? { ...x, ...p } : x)));
  return (
    <View style={s.col}>
      {items.map((x, i) => (
        <View key={`${i}-${x.text}`} style={[s.row, { borderColor: c.glassLine, backgroundColor: c.glassFill }]}>
          <PressableScale onPress={() => patch(i, { done: !x.done })} hitSlop={8} accessibilityRole="checkbox" accessibilityState={{ checked: x.done }} accessibilityLabel={x.text}>
            <Icon name={x.done ? "check-circle" : "circle"} size={22} color={x.done ? c.ok : c.gray} />
          </PressableScale>
          <Text variant="body" style={[s.text, x.done && s.strike]} tone={x.done ? "gray" : "ink"}>{x.text}</Text>
          <PressableScale onPress={() => onChange(items.filter((_, j) => j !== i))} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("adm.delete")}><Icon name="x" size={18} tone="gray" /></PressableScale>
        </View>
      ))}
      <View style={s.add}>
        <View style={s.grow}>
          <Input value={text} onChangeText={onText} onFocus={onFocus} placeholder={t("taskForm.itemPh")} maxLength={200} returnKeyType="done" submitBehavior="submit" onSubmitEditing={add} />
        </View>
        <PressableScale onPress={add} disabled={!text.trim()} accessibilityRole="button" accessibilityLabel={t("taskForm.addItem")} style={[s.btn, { backgroundColor: c.tint2 }, !text.trim() && s.off]}>
          <Icon name="plus" size={20} tone="accent" />
        </PressableScale>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1 },
  text: { flex: 1 },
  strike: { textDecorationLine: "line-through" },
  add: { flexDirection: "row", alignItems: "center", gap: 10 },
  grow: { flex: 1 },
  btn: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  off: { opacity: 0.5 },
});
