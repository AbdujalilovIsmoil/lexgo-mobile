import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { CheckItem } from "@/entities/pro-tasks";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { Icon, Input, PressableScale, Text } from "@/shared/ui";

type Props = { items: CheckItem[]; onChange: (v: CheckItem[]) => void };

// Checklist inside the task form: tick, remove, and add a new item.
export function ChecklistEditor({ items, onChange }: Props) {
  const { t } = useT();
  const c = useColors();
  const [text, setText] = useState("");
  const add = () => {
    if (!text.trim()) return;
    onChange([...items, { text: text.trim(), done: false }]);
    setText("");
  };
  const patch = (i: number, p: Partial<CheckItem>) => onChange(items.map((x, j) => (j === i ? { ...x, ...p } : x)));
  return (
    <View style={s.col}>
      <Text variant="small" tone="gray" style={s.label}>{t("aw7.checklist")}</Text>
      {items.map((x, i) => (
        <View key={`${i}-${x.text}`} style={[s.row, { borderColor: c.line, backgroundColor: c.surface }]}>
          <PressableScale onPress={() => patch(i, { done: !x.done })} hitSlop={8}>
            <Icon name={x.done ? "check-circle" : "circle"} size={21} color={x.done ? c.ok : c.gray} />
          </PressableScale>
          <Text variant="body" style={[s.text, x.done && s.strike]} tone={x.done ? "gray" : "ink"}>{x.text}</Text>
          <PressableScale onPress={() => onChange(items.filter((_, j) => j !== i))} hitSlop={8}><Icon name="x" size={18} tone="gray" /></PressableScale>
        </View>
      ))}
      <Input value={text} onChangeText={setText} placeholder={t("aw7.checkAdd")} returnKeyType="done" onSubmitEditing={add} right={<PressableScale onPress={add} hitSlop={8}><Icon name="plus-circle" size={22} tone="accent" /></PressableScale>} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 8 },
  label: { marginLeft: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, borderWidth: 1 },
  text: { flex: 1 },
  strike: { textDecorationLine: "line-through" },
});
