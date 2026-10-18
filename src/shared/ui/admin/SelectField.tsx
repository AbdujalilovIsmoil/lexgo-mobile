import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { Chip } from "../Chip";
import { Icon } from "../Icon";
import { PressableScale } from "../PressableScale";
import { Text } from "../Text";
import { Field } from "./Field";
import { OptionSheet } from "./OptionSheet";

type Props<T extends string> = { label?: string; value: T | ""; options: { value: T; label: string; hint?: string }[]; onChange: (v: T) => void; placeholder?: string; error?: string; searchable?: boolean };

// Choose one value: up to 4 options show as chips, more open a drawer.
export function SelectField<T extends string>({ label, value, options, onChange, placeholder, error, searchable }: Props<T>) {
  const { t } = useT();
  const c = useColors();
  const [open, setOpen] = useState(false);
  if (options.length <= 4) {
    return (
      <Field label={label} error={error}>
        <View style={s.chips}>{options.map((o) => <Chip key={o.value} label={o.label} active={o.value === value} onPress={() => onChange(o.value)} />)}</View>
      </Field>
    );
  }
  const current = options.find((o) => o.value === value)?.label;
  return (
    <Field label={label} error={error}>
      <PressableScale onPress={() => setOpen(true)} style={[s.box, { borderColor: error ? c.err : c.line, backgroundColor: c.surface }]}>
        <Text variant="body" tone={current ? "ink" : "gray2"} numberOfLines={1} style={s.text}>{current ?? placeholder ?? t("adm.selectOne")}</Text>
        <Icon name="chevron-down" size={18} tone="gray" />
      </PressableScale>
      <OptionSheet visible={open} onClose={() => setOpen(false)} title={label ?? ""} options={options} value={value || undefined} onPick={onChange} searchable={searchable ?? options.length > 8} />
    </Field>
  );
}

const s = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  box: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 52, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5 },
  text: { flex: 1 },
});
