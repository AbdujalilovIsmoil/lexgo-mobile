import { Platform, StyleSheet, View } from "react-native";
import type { TemplateCategoryInfo } from "@/entities/doc-template";
import { BottomSheet, Button, Icon, IconButton, PressableScale, SheetScroll, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { categoryLabel, languageLabel } from "./labels";

type Props = {
  visible: boolean; onClose: () => void; cats: TemplateCategoryInfo[]; keys: string[]; languages: string[];
  cat: string; lang: string; onCat: (v: string) => void; onLang: (v: string) => void; onReset: () => void; total: number;
};

// Mobile filters in a bottom sheet (README §19): the category and the language as two radio lists, a pinned bar with reset and "show N".
export function CatalogFilterSheet({ visible, onClose, cats, keys, languages, cat, lang, onCat, onLang, onReset, total }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const rows = (items: { value: string; label: string; count?: number }[], value: string, set: (v: string) => void) => (
    <View style={s.list}>
      {items.map((o) => {
        const on = value === o.value;
        return (
          <PressableScale key={o.value || "all"} haptic={false} onPress={() => { selectHaptic(); set(o.value); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.row, { backgroundColor: on ? c.tint2 : "transparent", borderColor: on ? c.accent : "transparent" }]}>
            <Text variant="body" weight={on ? "bold" : "regular"} numberOfLines={1} style={s.flex}>{o.label}</Text>
            {o.count !== undefined ? <Text variant="caption" tone="gray">{o.count}</Text> : null}
            <View style={[s.radio, { borderColor: on ? c.accent : c.gray2, backgroundColor: on ? c.accent : "transparent" }]}>{on ? <Icon name="check" size={13} color="#FFFFFF" /> : null}</View>
          </PressableScale>
        );
      })}
    </View>
  );
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("dcat.filters")} snaps={[0.7, 0.92]}>
      <View style={s.fill}>
        <SheetScroll contentContainerStyle={s.scroll}>
          <Text variant="small" tone="gray">{t("dcat.category")}</Text>
          {rows([{ value: "", label: t("dcat.allCategories") }, ...keys.map((k) => { const info = cats.find((x) => x.key === k); return { value: k, label: categoryLabel(t, k, info?.title), count: info?.count }; })], cat, onCat)}
          {languages.length > 1 ? (
            <>
              <Text variant="small" tone="gray">{t("dcat.language")}</Text>
              {rows([{ value: "", label: t("dcat.allLanguages") }, ...languages.map((l) => ({ value: l, label: languageLabel(t, l) }))], lang, onLang)}
            </>
          ) : null}
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: Platform.OS === "ios" ? 16 : Math.max(insets.bottom - 18, 12) }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("dcat.reset")} onPress={onReset} />
          <Button title={t("dcat.show", { n: total })} variant="gradient" full style={s.flex} onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingBottom: 12 },
  list: { gap: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 50, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1.5 },
  flex: { flex: 1 },
  radio: { width: 22, height: 22, borderRadius: radius.pill, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingHorizontal: 20, borderTopWidth: 1 },
});
