import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Chip, Input, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { docTypeApplies } from "../api/infoApi";
import { useDocTypes } from "../model/queries";
import type { DocTypeFlow } from "../model/types";

type Props = { flow: DocTypeFlow; value: string; onChange: (v: string) => void; label?: boolean };

// Optional "what kind of document" line the advocate reads first: one row of chips that scrolls sideways (the
// list can be long). The list comes from the backend; it hides itself when the backend does not offer the field.
export function DocTypePicker({ flow, value, onChange, label = true }: Props) {
  const { t } = useT();
  const opts = useDocTypes().data;
  const [custom, setCustom] = useState(false);
  if (!opts || !docTypeApplies(opts, flow)) return null;
  const own = custom || (!!value && !opts.items.includes(value));
  return (
    <View style={s.box}>
      {label ? <Text variant="small" tone="gray" style={s.label}>{t("dm7.typeLabel")}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
        {opts.items.map((x) => (
          <Chip key={x} label={x} active={!own && value === x} onPress={() => { setCustom(false); onChange(value === x ? "" : x); }} />
        ))}
        {opts.customAllowed ? <Chip label={t("dm7.typeCustom")} icon="edit-2" active={own} onPress={() => { setCustom(!own); if (own) onChange(""); }} /> : null}
      </ScrollView>
      {own ? <Input value={custom && opts.items.includes(value) ? "" : value} onChangeText={onChange} placeholder={t("dm7.typeCustomPh")} maxLength={120} /> : null}
      <Text variant="caption" tone="gray2" style={s.label}>{opts.optional ? t("dm7.typeHintOptional") : t("dm7.typeHint")}</Text>
    </View>
  );
}

const s = StyleSheet.create({ box: { gap: 8 }, label: { marginLeft: 4 }, chips: { flexDirection: "row", gap: 8, paddingRight: 8 } });
