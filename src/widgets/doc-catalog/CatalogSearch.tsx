import { useState, type Ref } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { useTheme } from "@/shared/theme";
import { Chip, Icon, PressableScale, singleLineText, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { HOME_BG } from "@/widgets/client-dash";

type Box = { ref: Ref<View>; collapsable: false };
// `field` / `filters` / `inputRef`: the search field and the filter button as remote-assistance controls (measured, focusable).
type Props = { value: string; onChange: (v: string) => void; onFilters: () => void; active: number; chips: { key: string; label: string; clear: () => void }[]; line: string; field?: Box; filters?: Box; inputRef?: Ref<TextInput> };

// The pinned top of the catalogue: the search field, the filter button (a dot while a filter is on), the active filters as chips that clear
// one by one, and a live line under it ("23 results of 989"). It stays on screen while the list scrolls.
export function CatalogSearch({ value, onChange, onFilters, active, chips, line, field, filters, inputRef }: Props) {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <View style={[s.wrap, { backgroundColor: dark ? c.canvas : HOME_BG }]}>
      <View style={s.row}>
        <View style={[s.field, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: focus ? c.accent : dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]} {...field}>
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
          <View {...filters}>
            <PressableScale onPress={onFilters} hitSlop={10} scale={0.92} accessibilityRole="button" accessibilityLabel={t("dcat.filters")} style={s.filter}>
              <Icon name="sliders" size={20} color={active > 0 ? c.accent : c.gray} />
              {active > 0 ? <View style={[s.dot, { backgroundColor: c.accent, borderColor: dark || glass ? c.surface : "#FFFFFF" }]} /> : null}
            </PressableScale>
          </View>
        </View>
      </View>
      {chips.length ? <View style={s.chips}>{chips.map((x) => <Chip key={x.key} label={x.label} active icon="x" onPress={x.clear} />)}</View> : null}
      {line ? <Text variant="small" tone="gray" accessibilityLiveRegion="polite" style={s.line}>{line}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 10, paddingTop: 6, paddingBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  field: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 54, paddingLeft: 16, paddingRight: 8, borderRadius: 16, borderWidth: 1 },
  filter: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", top: 6, right: 6, width: 9, height: 9, borderRadius: 5, borderWidth: 1.5 },
  line: { fontSize: 14.5 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
  input: { flex: 1, fontFamily: "Manrope_500Medium", fontSize: 16, paddingVertical: 12 },
  clear: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(138,153,172,0.2)" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
