import { StyleSheet, View } from "react-native";
import type { DocTemplate, TemplateCategoryInfo } from "@/entities/doc-template";
import { fmtMoney } from "@/shared/lib/money";
import { radius, shadows, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { PaperTile } from "./PaperTile";
import { categoryLabel, categoryTone, fillMinutes, languageLabel } from "./labels";

type Props = { item: DocTemplate; cats: TemplateCategoryInfo[]; onOpen: () => void; showLang: boolean; plain: Set<string> };

// One ready document as a sheet of paper in its category's colour (civil blue, economic teal, administrative amber, criminal red), the title as
// the hero, then the category with its dot, about how long filling takes, and a price only when there is one. A description shows only when
// it says something about this document: not when it repeats the title or a sentence shared by many documents. The language shows only when
// the catalogue has more than one.
export function CatalogRow({ item, cats, onOpen, showLang, plain }: Props) {
  const { t } = useT();
  const c = useColors();
  const tone = categoryTone(item.category);
  const color = tone === "gray" ? c.gray : c[tone];
  const cat = categoryLabel(t, item.category, cats.find((x) => x.key === item.category)?.title);
  const info = item.description.trim();
  const says = !!info && info !== item.name.trim() && !plain.has(info);
  const mins = item.fields ? fillMinutes(item.fields) : 0;
  const label = [item.name, cat, mins ? t("dcat.minutes", { n: mins }) : ""].filter(Boolean).join(". ");
  return (
    <PressableScale onPress={onOpen} accessibilityRole="button" accessibilityLabel={label} style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }, shadows.s1]}>
      <PaperTile color={color} paper={c.surface2} file={item.hasSource} />
      <View style={s.col}>
        <Text variant="body" weight="semibold" numberOfLines={3}>{item.name}</Text>
        {says ? <Text variant="small" tone="gray" numberOfLines={2}>{info}</Text> : null}
        <View style={s.meta}>
          <View style={s.cat}><View style={[s.dot, { backgroundColor: color }]} /><Text variant="caption" weight="semibold" numberOfLines={1} style={{ color }}>{cat}</Text></View>
          {mins ? <View style={s.cat}><Icon name="clock" size={12} tone="gray" /><Text variant="caption" tone="gray">{t("dcat.minutes", { n: mins })}</Text></View> : null}
          {showLang && item.language ? <Text variant="caption" tone="gray" numberOfLines={1}>{languageLabel(t, item.language)}</Text> : null}
          {item.price > 0 ? <Text variant="caption" weight="bold" tone="accent">{t("dcat.priceSum", { price: fmtMoney(item.price) })}</Text> : null}
        </View>
      </View>
      <Icon name="chevron-right" size={18} tone="gray" />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingLeft: 14, paddingRight: 10, borderRadius: radius.rl, borderWidth: 1, minHeight: 92 },
  col: { flex: 1, gap: 5 },
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", columnGap: 12, rowGap: 4 },
  cat: { flexDirection: "row", alignItems: "center", gap: 5, flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
