import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, singleLineText, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { value: string; onChange: (v: string) => void; found: number; total: number };

// A roomy pill search field: search icon, clear button, the accent ring while it has focus, and under it a live line
// («23 ta natija» / «Hech narsa topilmadi»), so typing always answers something.
export function TemplateSearch({ value, onChange, found, total }: Props) {
  const { t } = useT();
  const c = useColors();
  const [focus, setFocus] = useState(false);
  const typing = value.trim().length > 0;
  return (
    <View style={s.wrap}>
      <View style={[s.field, { backgroundColor: c.surface2, borderColor: focus ? c.accent : c.line }]}>
        <Icon name="search" size={20} color={focus ? c.accent : c.gray} />
        <TextInput
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder={t("tpl.search")}
          placeholderTextColor={c.gray2}
          accessibilityLabel={t("tpl.search")}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="never"
          selectionColor={c.accent}
          style={[s.input, singleLineText, { color: c.ink }]}
        />
        {typing ? (
          <PressableScale onPress={() => onChange("")} hitSlop={10} accessibilityRole="button" accessibilityLabel={t("tpl.clear")} style={s.clear}>
            <Icon name="x" size={16} tone="gray" />
          </PressableScale>
        ) : null}
      </View>
      {typing ? (
        <Text variant="caption" tone={found ? "gray" : "warn"} accessibilityLiveRegion="polite">{found ? t("tpl.found", { n: found, total }) : t("tpl.notFound")}</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 6 },
  field: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1.5 },
  input: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 16, paddingVertical: 12 },
  clear: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(138,153,172,0.2)" },
});
