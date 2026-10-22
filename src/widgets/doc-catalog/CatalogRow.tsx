import { StyleSheet, View } from "react-native";
import type { DocTemplate, TemplateCategoryInfo } from "@/entities/doc-template";
import { fmtMoney } from "@/shared/lib/money";
import { radius, shadows, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { categoryLabel, languageLabel } from "./labels";

type Props = { item: DocTemplate; cats: TemplateCategoryInfo[]; onOpen: () => void };

// One ready document: its title (never an id), a line of description, the category, language, a price when there is one, and an open action.
export function CatalogRow({ item, cats, onOpen }: Props) {
  const { t } = useT();
  const c = useColors();
  const cat = categoryLabel(t, item.category, cats.find((x) => x.key === item.category)?.title);
  const same = item.description.trim() === item.name.trim();
  const meta = [cat, item.language ? languageLabel(t, item.language) : "", item.price > 0 ? t("dcat.priceSum", { price: fmtMoney(item.price) }) : ""].filter(Boolean).join(" · ");
  return (
    <PressableScale onPress={onOpen} accessibilityRole="button" accessibilityLabel={`${item.name}. ${meta}`} style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }, shadows.s1]}>
      <View style={[s.tile, { backgroundColor: c.tint2 }]}><Icon name="file-text" size={22} tone="accent" /></View>
      <View style={s.col}>
        <Text variant="body" weight="semibold" numberOfLines={3}>{item.name}</Text>
        {item.description && !same ? <Text variant="small" tone="gray" numberOfLines={2}>{item.description}</Text> : null}
        <View style={s.meta}>
          <Text variant="caption" tone="gray" numberOfLines={1} style={s.flex}>{meta}</Text>
          {item.hasSource ? <Icon name="paperclip" size={13} tone="gray" /> : null}
        </View>
      </View>
      <Icon name="chevron-right" size={20} tone="gray" />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.rl, borderWidth: 1, minHeight: 84 },
  tile: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 4 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  flex: { flex: 1 },
});
