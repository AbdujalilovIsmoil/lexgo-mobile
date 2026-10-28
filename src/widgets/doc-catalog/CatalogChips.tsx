import { ScrollView, StyleSheet } from "react-native";
import { TEMPLATE_CATEGORIES, type TemplateCategoryInfo } from "@/entities/doc-template";
import { useColors } from "@/shared/theme";
import { Chip } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { categoryLabel, categoryTone } from "./labels";

type Props = { cats: TemplateCategoryInfo[]; keys: string[]; value: string; onChange: (v: string) => void };

// One row of category chips under the search: "Hammasi" with the whole count, then each branch with its count and its colour dot.
// A tap filters at once; the same choice is mirrored in the filter sheet.
export function CatalogChips({ cats, keys, value, onChange }: Props) {
  const { t } = useT();
  const c = useColors();
  const total = cats.reduce((a, x) => a + x.count, 0);
  const label = (name: string, n?: number) => (n ? `${name} · ${n}` : name);
  // The four known branches in their fixed order (civil, economic, administrative, criminal), anything else after them.
  const rank = (k: string) => { const i = (TEMPLATE_CATEGORIES as readonly string[]).indexOf(k); return i < 0 ? 99 : i; };
  const ordered = [...keys].sort((a, b) => rank(a) - rank(b));
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={s.rail} contentContainerStyle={s.row}>
      <Chip label={label(t("dcat.all"), total)} active={!value} onPress={() => onChange("")} />
      {ordered.map((k) => {
        const info = cats.find((x) => x.key === k);
        const tone = categoryTone(k);
        return <Chip key={k} label={label(categoryLabel(t, k, info?.title), info?.count)} active={value === k} color={tone === "gray" ? c.gray : c[tone]} onPress={() => onChange(value === k ? "" : k)} />;
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  rail: { marginHorizontal: -16 },
  row: { gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
});
