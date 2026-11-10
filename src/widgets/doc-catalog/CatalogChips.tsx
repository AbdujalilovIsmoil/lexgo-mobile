import { StyleSheet, View } from "react-native";
import { TEMPLATE_CATEGORIES, type TemplateCategoryInfo } from "@/entities/doc-template";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { CategoryTabs } from "@/widgets/service-browser";
import { categoryLabel, categoryTone } from "./labels";

type Props = { cats: TemplateCategoryInfo[]; keys: string[]; value: string; onChange: (v: string) => void };

// One row of category tabs under the search, the same white pills as the Services tab: "Hammasi" with the whole count, then each branch
// with its count and its colour dot. A tap filters at once (a second tap clears it); the same choice is mirrored in the filter sheet.
export function CatalogChips({ cats, keys, value, onChange }: Props) {
  const { t } = useT();
  const c = useColors();
  const total = cats.reduce((a, x) => a + x.count, 0);
  const label = (name: string, n?: number) => (n ? `${name} · ${n}` : name);
  // The four known branches in their fixed order (civil, economic, administrative, criminal), anything else after them.
  const rank = (k: string) => { const i = (TEMPLATE_CATEGORIES as readonly string[]).indexOf(k); return i < 0 ? 99 : i; };
  const ordered = [...keys].sort((a, b) => rank(a) - rank(b));
  const tabs = [
    { id: "", label: label(t("dcat.all"), total) },
    ...ordered.map((k) => {
      const info = cats.find((x) => x.key === k);
      const tone = categoryTone(k);
      return { id: k, label: label(categoryLabel(t, k, info?.title), info?.count), dot: tone === "gray" ? c.gray : c[tone] };
    }),
  ];
  return (
    <View style={s.wrap}>
      <CategoryTabs tabs={tabs} value={value} onChange={(id) => onChange(value === id ? "" : id)} />
    </View>
  );
}

const s = StyleSheet.create({ wrap: { paddingTop: 2, paddingBottom: 8 } });
