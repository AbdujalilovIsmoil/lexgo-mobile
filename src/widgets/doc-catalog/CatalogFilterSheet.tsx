import { Platform, StyleSheet, View } from "react-native";
import type { TemplateCategoryInfo } from "@/entities/doc-template";
import { BottomSheet, Button, FilterChips, IconButton, SheetScroll, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { categoryLabel, languageLabel } from "./labels";

type Props = {
  visible: boolean; onClose: () => void; cats: TemplateCategoryInfo[]; keys: string[]; languages: string[];
  cat: string; lang: string; onCat: (v: string) => void; onLang: (v: string) => void; onReset: () => void; total: number;
};

// Mobile filters in a bottom sheet (Adliya): the category and the language as wrapped chips (the picked one navy), a pinned bar with reset and
// "show N".
export function CatalogFilterSheet({ visible, onClose, cats, keys, languages, cat, lang, onCat, onLang, onReset, total }: Props) {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const insets = useInsets();
  const catOpts = [{ value: "", label: t("dcat.allCategories") }, ...keys.map((k) => ({ value: k, label: categoryLabel(t, k, cats.find((x) => x.key === k)?.title) }))];
  const langOpts = [{ value: "", label: t("dcat.allLanguages") }, ...languages.map((l) => ({ value: l, label: languageLabel(t, l) }))];
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("dcat.filters")} snaps={[0.62, 0.92]}>
      <View style={s.fill}>
        <SheetScroll contentContainerStyle={s.scroll}>
          <View style={s.group}>
            <Text variant="small" tone="gray" weight="semibold" style={s.label}>{t("dcat.category")}</Text>
            <FilterChips options={catOpts} value={cat} onChange={onCat} />
          </View>
          {languages.length > 1 ? (
            <View style={s.group}>
              <Text variant="small" tone="gray" weight="semibold" style={s.label}>{t("dcat.language")}</Text>
              <FilterChips options={langOpts} value={lang} onChange={onLang} />
            </View>
          ) : null}
        </SheetScroll>
        <View style={[s.bar, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", paddingBottom: Platform.OS === "ios" ? 16 : Math.max(insets.bottom - 18, 12) }]}>
          <IconButton icon="rotate-ccw" size={54} label={t("dcat.reset")} onPress={onReset} />
          <Button title={t("dcat.show", { n: total })} variant="primary" size="lg" full style={s.flex} onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingBottom: 12, gap: 20 },
  group: { gap: 12 },
  label: { fontSize: 14.5 },
  flex: { flex: 1 },
  bar: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 12, paddingHorizontal: 20 },
});
