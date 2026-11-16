import { StyleSheet, View } from "react-native";
import { TEMPLATE_CATEGORIES, type TemplateCategoryInfo } from "@/entities/doc-template";
import { useT } from "@/shared/i18n";
import { CategoryTabs } from "@/widgets/service-browser";
import { categoryLabel } from "./labels";

type Props = { cats: TemplateCategoryInfo[]; keys: string[]; value: string; onChange: (v: string) => void };

// One row of category tabs under the search, the same white pills as the Services tab: "Hammasi" with the whole count, then each branch
// with its count as a small badge (Adliya). A tap filters at once (a second tap clears it); the same choice is mirrored in the filter sheet.
export function CatalogChips({ cats, keys, value, onChange }: Props) {
  const { t } = useT();
  const total = cats.reduce((a, x) => a + x.count, 0);
  // The four known branches in their fixed order (civil, economic, administrative, criminal), anything else after them.
  const rank = (k: string) => { const i = (TEMPLATE_CATEGORIES as readonly string[]).indexOf(k); return i < 0 ? 99 : i; };
  const ordered = [...keys].sort((a, b) => rank(a) - rank(b));
  const tabs = [
    { id: "", label: t("dcat.all"), count: total || undefined },
    ...ordered.map((k) => {
      const info = cats.find((x) => x.key === k);
      return { id: k, label: categoryLabel(t, k, info?.title), count: info?.count || undefined };
    }),
  ];
  return (
    <View style={s.wrap}>
      <CategoryTabs tabs={tabs} value={value} onChange={(id) => onChange(value === id ? "" : id)} />
    </View>
  );
}

const s = StyleSheet.create({ wrap: { paddingTop: 2, paddingBottom: 8 } });
