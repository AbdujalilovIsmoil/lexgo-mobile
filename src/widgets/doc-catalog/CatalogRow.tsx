import { StyleSheet, View } from "react-native";
import type { DocTemplate, TemplateCategoryInfo } from "@/entities/doc-template";
import { fmtMoney } from "@/shared/lib/money";
import { radius, shadows, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { PaperTile } from "./PaperTile";
import { categoryLabel, categoryTone, fillMinutes } from "./labels";

type Props = { item: DocTemplate; cats: TemplateCategoryInfo[]; onOpen: () => void };

// One ready document as a compact row: a sheet of paper in its category's colour (civil blue, economic teal, administrative amber, criminal red),
// the title on at most two lines, then one meta line — the category with its dot, about how long filling takes, and the price (or "free").
// The description and the language stay on the template's page and in the filter sheet: a row has to scan in a glance.
export function CatalogRow({ item, cats, onOpen }: Props) {
  const { t } = useT();
  const c = useColors();
  const tone = categoryTone(item.category);
  const color = tone === "gray" ? c.gray : c[tone];
  const cat = categoryLabel(t, item.category, cats.find((x) => x.key === item.category)?.title);
  const mins = item.fields ? fillMinutes(item.fields) : 0;
  const label = [item.name, cat, mins ? t("dcat.minutes", { n: mins }) : ""].filter(Boolean).join(". ");
  return (
    <PressableScale onPress={onOpen} accessibilityRole="button" accessibilityLabel={label} style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }, shadows.s1]}>
      <PaperTile color={color} paper={c.surface2} file={item.hasSource} />
      <View style={s.col}>
        <Text variant="body" weight="semibold" numberOfLines={2}>{item.name}</Text>
        <View style={s.meta}>
          <View style={s.cat}><View style={[s.dot, { backgroundColor: color }]} /><Text variant="caption" weight="semibold" numberOfLines={1} style={{ color }}>{cat}</Text></View>
          {mins ? <View style={s.cat}><Icon name="clock" size={12} tone="gray" /><Text variant="caption" tone="gray">{t("dcat.minutes", { n: mins })}</Text></View> : null}
          <Text variant="caption" weight="bold" tone={item.price > 0 ? "accent" : "gray"}>{item.price > 0 ? t("dcat.priceSum", { price: fmtMoney(item.price) }) : t("dcat.free")}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={18} tone="gray" />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, paddingLeft: 12, paddingRight: 10, borderRadius: radius.rl, borderWidth: 1, minHeight: 76 },
  col: { flex: 1, gap: 5 },
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", columnGap: 12, rowGap: 4 },
  cat: { flexDirection: "row", alignItems: "center", gap: 5, flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
