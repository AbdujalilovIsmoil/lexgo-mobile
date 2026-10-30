import type { Ref } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { AREA_KEYS, useGeoLabels, type Lawyer, type LawyerFilters } from "@/entities/lawyer";
import { ActiveFilters, SearchSuggest, type Pick } from "@/features/lawyer-filter";
import { Icon, PressableScale, Text, singleLineText } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = {
  filters: LawyerFilters;
  setFilters: (p: Partial<LawyerFilters>) => void;
  text: string;
  onText: (v: string) => void;
  focused: boolean;
  onFocus: (v: boolean) => void;
  aiMode: boolean; // the field takes a description of the problem for the AI search
  onAiMode: (v: boolean) => void;
  onSubmit: () => void;
  onPick: (p: Pick) => void;
  lawyers: Lawyer[];
  activeCount: number;
  onFilters: () => void;
  promo?: React.ReactNode; // the paid banners, shown while nothing is searched
  section: string; // the list's heading ("Recommended" / "N specialists")
  field?: { ref: Ref<View>; collapsable: false };
  filtersField?: { ref: Ref<View>; collapsable: false };
  inputRef?: Ref<TextInput>;
};

// The directory's top: the search field with the filter button, then — while the field is in use — the Google-like suggestions, otherwise
// the chips (all / advocate / lawyer / practice areas — the chosen area first, so it is in view), the "describe your problem" row that turns the field into the AI search, the active
// filters, the paid banners and the list's heading.
export function DirectoryTop({ filters, setFilters, text, onText, focused, onFocus, aiMode, onAiMode, onSubmit, onPick, lawyers, activeCount, onFilters, promo, section, field, filtersField, inputRef }: Props) {
  const { t } = useT();
  const c = useColors();
  const geo = useGeoLabels();
  const f = filters;
  const chip = (key: string, label: string, on: boolean, press: () => void) => (
    <PressableScale key={key} onPress={press} scale={0.96} accessibilityRole="button" accessibilityState={{ selected: on }} style={[s.chip, on ? { backgroundColor: c.ink, borderColor: c.ink } : { backgroundColor: c.surface, borderColor: c.line }]}>
      <Text variant="small" weight="semibold" style={{ color: on ? c.bg : c.ink }}>{label}</Text>
    </PressableScale>
  );
  const ai = aiMode;
  return (
    <View style={s.wrap}>
      <View style={s.searchRow}>
        <View {...field} style={[s.field, { backgroundColor: c.surface, borderColor: ai ? c.accent : focused ? c.accent : c.line }]}>
          <Icon name={ai ? "star" : "search"} size={19} color={ai ? c.accent : c.gray} />
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
          {text ? <PressableScale onPress={() => onText("")} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("dcat.clearSearch")}><Icon name="x" size={17} tone="gray" /></PressableScale> : null}
          {ai ? (
            <PressableScale onPress={onSubmit} disabled={!text.trim()} scale={0.95} style={[s.find, { backgroundColor: c.accent, opacity: text.trim() ? 1 : 0.5 }]} accessibilityRole="button">
              <Text variant="small" weight="bold" tone="white">{t("mk1.dir.aiFind")}</Text>
            </PressableScale>
          ) : null}
        </View>
        {ai ? (
          <PressableScale onPress={() => onAiMode(false)} hitSlop={6} accessibilityRole="button" style={s.cancel}><Text variant="small" weight="semibold" tone="accent">{t("mk1.dir.aiCancel")}</Text></PressableScale>
        ) : (
          <View {...filtersField}>
            <PressableScale onPress={onFilters} scale={0.95} accessibilityRole="button" accessibilityLabel={t("ra.el.filters")} style={[s.filter, { backgroundColor: c.surface, borderColor: activeCount ? c.accent : c.line }]}>
              <Icon name="sliders" size={20} color={activeCount ? c.accent : c.ink} />
              {activeCount ? <View style={[s.dot, { backgroundColor: c.accent }]}><Text variant="caption" weight="bold" tone="white" style={s.dotTx}>{activeCount}</Text></View> : null}
            </PressableScale>
          </View>
        )}
      </View>

      {focused && !ai ? (
        <SearchSuggest text={text} lawyers={lawyers} onPick={onPick} />
      ) : (
        <>
          {!ai ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={s.chips}>
              {chip("all", t("mk1.dir.all"), f.kind === "all" && !f.area, () => setFilters({ kind: "all", area: "" }))}
              {chip("adv", t("mkw.roles.advokat"), f.kind === "advokat", () => setFilters({ kind: f.kind === "advokat" ? "all" : "advokat" }))}
              {chip("yur", t("mkw.roles.yurist"), f.kind === "yurist", () => setFilters({ kind: f.kind === "yurist" ? "all" : "yurist" }))}
              {[...AREA_KEYS].sort((x, y) => Number(y === f.area) - Number(x === f.area)).map((a) => chip(a, geo.area(a), f.area === a, () => setFilters({ area: f.area === a ? "" : a })))}
            </ScrollView>
          ) : null}
          {!ai ? (
            <PressableScale onPress={() => onAiMode(true)} scale={0.98} accessibilityRole="button" style={[s.aiRow, { backgroundColor: c.surface, borderColor: c.line }]}>
              <View style={[s.aiIco, { backgroundColor: c.surface2 }]}><Icon name="star" size={18} color={c.accent} /></View>
              <View style={s.flex}>
                <Text variant="h4">{t("mk1.dir.aiTitle")}</Text>
                <Text variant="small" tone="gray">{t("mk1.dir.aiSub")}</Text>
              </View>
              <Icon name="chevron-right" size={18} tone="gray" />
            </PressableScale>
          ) : null}
          <View style={s.pad}><ActiveFilters /></View>
          {promo}
          <Text variant="caption" weight="bold" tone="gray" style={s.section}>{section.toUpperCase()}</Text>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 12, marginHorizontal: -16 },
  pad: { paddingHorizontal: 16 },
  flex: { flex: 1, minWidth: 0, gap: 2 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16 },
  field: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 54, borderRadius: 18, borderWidth: 1.5, paddingLeft: 16, paddingRight: 8 },
  input: { flex: 1, minWidth: 0, fontSize: 16, paddingVertical: 12 },
  find: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  cancel: { paddingHorizontal: 2, paddingVertical: 10 },
  filter: { width: 54, height: 54, borderRadius: 18, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", top: 6, right: 6, minWidth: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  dotTx: { fontSize: 10, lineHeight: 12 },
  chips: { gap: 8, paddingHorizontal: 16 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 9 },
  aiRow: { flexDirection: "row", alignItems: "center", gap: 14, marginHorizontal: 16, padding: 16, borderRadius: 20, borderWidth: 1 },
  aiIco: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  section: { paddingHorizontal: 18, letterSpacing: 0.7, marginTop: 4 },
});
