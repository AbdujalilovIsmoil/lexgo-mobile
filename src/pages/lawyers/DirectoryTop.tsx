import type { Ref } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import type { LawyerFilters } from "@/entities/lawyer";
import { ActiveFilters } from "@/features/lawyer-filter";
import { FilterSeg, Icon, PressableScale, Text, singleLineText } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Box = { ref: Ref<View>; collapsable: false };

type BarProps = {
  filters: LawyerFilters;
  setFilters: (p: Partial<LawyerFilters>) => void;
  text: string;
  onText: (v: string) => void;
  focused: boolean;
  onFocus: (v: boolean) => void;
  aiMode: boolean; // the field takes a description of the problem for the AI search
  onAiMode: (v: boolean) => void;
  onSubmit: () => void;
  onExit: () => void; // the × while the field is in use: clears it and leaves it
  activeCount: number;
  onFilters: () => void;
  field?: Box;
  filtersField?: Box;
  inputRef?: Ref<TextInput>;
};

// The directory's pinned top (Adliya): the type switch (all / advocates / lawyers) and the search field — the filter button inside it on the
// right, and an × that clears the field and leaves it while it is in use.
export function DirectoryBar({ filters, setFilters, text, onText, focused, onFocus, aiMode, onAiMode, onSubmit, onExit, activeCount, onFilters, field, filtersField, inputRef }: BarProps) {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const ai = aiMode;
  const box = { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: ai || focused ? c.accent : dark || glass ? c.line : "#E6EBF3" };
  return (
    <View style={s.bar}>
      {!ai ? (
        <FilterSeg fill compact options={[{ value: "all", label: t("mk1.dir.all") }, { value: "advokat", label: t("flt.kindOptions.advokat") }, { value: "yurist", label: t("flt.kindOptions.yurist") }]} value={filters.kind} onChange={(kind) => setFilters({ kind })} />
      ) : null}
      <View style={s.searchRow}>
        <View {...field} style={[s.field, box, !glass && s.shadow]}>
          <Icon name={ai ? "star" : "search"} size={18} color={ai ? c.accent : c.gray} />
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={onText}
            onFocus={() => onFocus(true)}
            onBlur={() => onFocus(false)}
            onSubmitEditing={onSubmit}
            returnKeyType={ai ? "send" : "search"}
            placeholder={ai ? t("mk1.dir.aiPh") : t("mk1.dir.searchPh")}
            placeholderTextColor={c.gray2}
            accessibilityLabel={ai ? t("mk1.dir.aiTitle") : t("mk1.dir.searchPh")}
            style={[s.input, { color: c.ink }, singleLineText]}
          />
          {text || focused ? (
            <PressableScale onPress={onExit} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("dcat.clearSearch")} style={[s.x, { backgroundColor: dark || glass ? c.surface2 : "#EEF2F7" }]}>
              <Icon name="x" size={15} color={c.gray} />
            </PressableScale>
          ) : null}
          {ai ? (
            <PressableScale onPress={onSubmit} disabled={!text.trim()} scale={0.95} style={[s.find, { backgroundColor: c.accent, opacity: text.trim() ? 1 : 0.5 }]} accessibilityRole="button">
              <Text variant="small" weight="bold" tone="white">{t("mk1.dir.aiFind")}</Text>
            </PressableScale>
          ) : (
            <View {...filtersField} style={s.filterBox}>
              <View style={[s.split, { backgroundColor: dark || glass ? c.line : "#E6EBF3" }]} />
              <PressableScale onPress={onFilters} hitSlop={6} scale={0.92} accessibilityRole="button" accessibilityLabel={t("ra.el.filters")} style={s.filter}>
                <Icon name="sliders" size={18} color={activeCount ? c.accent : c.ink} />
                {activeCount ? <View style={[s.dot, { backgroundColor: c.accent }]}><Text variant="caption" weight="bold" tone="white" style={s.dotTx}>{activeCount}</Text></View> : null}
              </PressableScale>
            </View>
          )}
        </View>
        {ai ? (
          <PressableScale onPress={() => onAiMode(false)} hitSlop={6} accessibilityRole="button" style={s.cancel}><Text variant="small" weight="semibold" tone="accent">{t("mk1.dir.aiCancel")}</Text></PressableScale>
        ) : null}
      </View>
    </View>
  );
}

// The head of the list, under the pinned bar: the active filters, the paid banners and the count ("324 ta mutaxassis topildi"). The
// "describe your problem" way into the AI search is the floating button in the corner on this page (LawyersPage).
export function DirectoryHead({ promo, section }: { promo?: React.ReactNode; section: string }) {
  return (
    <View style={s.head}>
      <View style={s.pad}><ActiveFilters /></View>
      {promo}
      <Text variant="small" tone="gray" style={s.section}>{section}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { gap: 10, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10 },
  head: { gap: 12, marginHorizontal: -16, paddingTop: 2 },
  pad: { paddingHorizontal: 16 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  field: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, minHeight: 46, borderRadius: 14, borderWidth: 1, paddingLeft: 14, paddingRight: 4 },
  input: { flex: 1, minWidth: 0, fontSize: 15, paddingVertical: 10 },
  x: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  find: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, marginRight: 2 },
  cancel: { paddingHorizontal: 2, paddingVertical: 10 },
  filterBox: { flexDirection: "row", alignItems: "center" },
  split: { width: 1, height: 22, marginHorizontal: 2 },
  filter: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", top: 3, right: 3, minWidth: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  dotTx: { fontSize: 9.5, lineHeight: 12 },
  section: { paddingHorizontal: 18, fontSize: 14, marginTop: 2 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
