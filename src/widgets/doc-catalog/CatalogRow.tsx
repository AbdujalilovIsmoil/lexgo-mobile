import { Platform, StyleSheet, View } from "react-native";
import type { DocTemplate, TemplateCategoryInfo } from "@/entities/doc-template";
import { fmtMoney } from "@/shared/lib/money";
import { useTheme } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { categoryLabel, languageLabel } from "./labels";

type Props = { item: DocTemplate; cats: TemplateCategoryInfo[]; onOpen: () => void };

// One ready document as a white card (Adliya): a small sheet of paper with a folded corner and the document mark, the title, one grey line
// (category · language · N fields) and the price on the right — "Bepul" in green, else the sum in bold.
export function CatalogRow({ item, cats, onOpen }: Props) {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const cat = categoryLabel(t, item.category, cats.find((x) => x.key === item.category)?.title);
  const meta = [cat, item.language ? languageLabel(t, item.language) : "", item.fields ? t("dcat.fieldsN", { n: item.fields }) : ""].filter(Boolean).join(" · ");
  const free = !(item.price > 0);
  const price = free ? t("dcat.free") : fmtMoney(item.price);
  const card = { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" };
  return (
    <PressableScale onPress={onOpen} scale={0.99} accessibilityRole="button" accessibilityLabel={[item.name, meta, price].join(". ")} style={[s.card, card, !glass && s.shadow]}>
      <View style={[s.paper, { backgroundColor: card.backgroundColor, borderColor: dark || glass ? c.line : "#DCE3EE" }]}>
        <View style={[s.fold, { backgroundColor: c.tint2 }]} />
        <Icon name="file-text" size={20} color={c.accent} />
      </View>
      <View style={s.col}>
        <Text variant="body" weight="bold" numberOfLines={2} style={s.name}>{item.name}</Text>
        {meta ? <Text variant="small" tone="gray" numberOfLines={2} style={s.meta}>{meta}</Text> : null}
      </View>
      <Text variant="body" weight="bold" numberOfLines={1} style={[s.price, { color: free ? c.ok : c.ink }]}>{price}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 18, borderWidth: 1, minHeight: 76 },
  paper: { width: 40, height: 46, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  fold: { position: "absolute", top: -7, right: -7, width: 14, height: 14, transform: [{ rotate: "45deg" }] },
  col: { flex: 1, minWidth: 0, gap: 3 },
  name: { fontSize: 15.5, lineHeight: 21 },
  meta: { fontSize: 13, lineHeight: 18 },
  price: { fontSize: 15, maxWidth: 110, textAlign: "right" },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
