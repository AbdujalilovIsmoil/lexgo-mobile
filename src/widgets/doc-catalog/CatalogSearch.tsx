import { useState, type Ref } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Chip, IconButton, Icon, PressableScale, singleLineText, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Box = { ref: Ref<View>; collapsable: false };
// `field` / `filters` / `inputRef`: the search field and the filter button as remote-assistance controls (measured, focusable).
type Props = { value: string; onChange: (v: string) => void; onFilters: () => void; active: number; chips: { key: string; label: string; clear: () => void }[]; line: string; field?: Box; filters?: Box; inputRef?: Ref<TextInput> };

// The pinned top of the catalogue: the search field, the filter button (a dot while a filter is on), the active filters as chips that clear
// one by one, and a live line under it ("23 results of 989"). It stays on screen while the list scrolls.
export function CatalogSearch({ value, onChange, onFilters, active, chips, line, field, filters, inputRef }: Props) {
  const { t } = useT();
  const c = useColors();
  const [focus, setFocus] = useState(false);
  return (
    <View style={[s.wrap, { backgroundColor: c.canvas }]}>
      <View style={s.row}>
        <View style={[s.field, { backgroundColor: c.surface2, borderColor: focus ? c.accent : c.line }]} {...field}>
          <Icon name="search" size={20} color={focus ? c.accent : c.gray} />
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChange}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            placeholder={t("dcat.search")}
            placeholderTextColor={c.gray2}
            accessibilityLabel={t("dcat.search")}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            selectionColor={c.accent}
            style={[s.input, singleLineText, { color: c.ink }]}
          />
          {value ? (
            <PressableScale onPress={() => onChange("")} hitSlop={10} accessibilityRole="button" accessibilityLabel={t("dcat.clearSearch")} style={s.clear}><Icon name="x" size={16} tone="gray" /></PressableScale>
          ) : null}
        </View>
        <View {...filters}><IconButton icon="sliders" size={52} label={t("dcat.filters")} badge={active > 0} onPress={onFilters} /></View>
      </View>
      {chips.length ? <View style={s.chips}>{chips.map((x) => <Chip key={x.key} label={x.label} active icon="x" onPress={x.clear} />)}</View> : null}
      {line ? <Text variant="caption" tone="gray" accessibilityLiveRegion="polite">{line}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 8, paddingTop: 6, paddingBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  field: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1.5 },
  input: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 16, paddingVertical: 12 },
  clear: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(138,153,172,0.2)" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
