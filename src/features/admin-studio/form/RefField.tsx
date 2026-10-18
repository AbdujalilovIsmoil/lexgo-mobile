import { useState } from "react";
import { StyleSheet } from "react-native";
import { useReference, useStudioText } from "@/entities/admin-studio";
import { Field } from "@/shared/ui/admin";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { RefSheet } from "./RefSheet";
import { refLabel, rememberRefs } from "./refLabels";

type Props = { label: string; source: string; value: string[]; multi?: boolean; onChange: (v: string[]) => void; readOnly?: boolean; error?: string; required?: boolean };

// Pick one or many values of a reference list (the schema's `source`). Shows the labels of the first page.
export function RefField({ label, source, value, multi, onChange, readOnly, error, required }: Props) {
  const { t } = useT();
  const c = useColors();
  const { fieldErr } = useStudioText();
  const [open, setOpen] = useState(false);
  const known = useReference(source, "").data ?? [];
  rememberRefs(known);
  const text = value.map((v) => known.find((r) => r.value === v)?.label ?? refLabel(v) ?? `${v.slice(0, 8)}…`).join(", ");
  return (
    <Field label={required ? `${label} *` : label} error={error ? fieldErr(error) : undefined}>
      <PressableScale disabled={readOnly} onPress={() => setOpen(true)} style={[s.box, { borderColor: error ? c.err : c.line, backgroundColor: c.surface }]}>
        <Text variant="body" tone={text ? "ink" : "gray2"} numberOfLines={2} style={s.text}>{text || t("adm.selectOne")}</Text>
        {readOnly ? null : <Icon name="chevron-down" size={18} tone="gray" />}
      </PressableScale>
      <RefSheet visible={open} onClose={() => setOpen(false)} title={label} source={source} value={value} multi={multi} onPick={onChange} />
    </Field>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 52, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1.5 },
  text: { flex: 1 },
});
