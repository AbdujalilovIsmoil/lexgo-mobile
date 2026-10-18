import { useState } from "react";
import { StyleSheet } from "react-native";
import { brand, radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { OptionSheet } from "@/shared/ui/admin";

export type FilterField = { key: string; label: string; value: string; empty: string; options: { value: string; label: string }[]; onChange: (v: string) => void };

// One filter of the bar: the label while unset, the chosen option once set; opens a drawer.
export function FilterSelect({ field }: { field: FilterField }) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  const on = field.value !== field.empty;
  const shown = on ? field.options.find((o) => o.value === field.value)?.label.replace(/\s\(\d+\)$/, "") : field.label;
  return (
    <>
      <PressableScale onPress={() => setOpen(true)} style={[s.pill, { backgroundColor: on ? brand.b600 : c.surface2, borderColor: on ? brand.b600 : c.line }]}>
        <Text variant="small" weight="semibold" numberOfLines={1} style={{ color: on ? "#fff" : c.ink, maxWidth: 170 }}>{shown}</Text>
        <Icon name="chevron-down" size={14} color={on ? "#fff" : c.gray} />
      </PressableScale>
      <OptionSheet visible={open} onClose={() => setOpen(false)} title={field.label} options={field.options} value={field.value} onPick={field.onChange} />
    </>
  );
}

const s = StyleSheet.create({
  pill: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1 },
});
