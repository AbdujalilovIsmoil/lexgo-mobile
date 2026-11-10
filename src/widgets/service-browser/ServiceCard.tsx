import { StyleSheet, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { CategoryIcon } from "@/entities/service";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { brand, radius, shadows, useTheme } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import type { BrowseCard } from "./model/cards";

export const HUES = [
  { bg: "#E6F0FF", fg: "#1668F0" },
  { bg: "#F1EDFF", fg: "#7C4DFF" },
  { bg: "#E3F7EF", fg: "#0E8F73" },
  { bg: "#FFF1DF", fg: "#C76A0A" },
  { bg: "#FFE9EF", fg: "#D63A6A" },
  { bg: "#E6F7E6", fg: "#2E8B3D" },
] as const;

type Props = { card: BrowseCard; category: string; slugs: readonly string[]; hue: (typeof HUES)[number]; bought: boolean; onPress: () => void };

// One service as a row, like the "Advokat va yuristlar" row above it: its category's icon on a tile, the title, the category, then the catalogue
// price with how many specialists offer it. Nobody offers it: the row stays on the list but does nothing.
// Already bought: a tap opens that order.
export function ServiceCard({ card, category, slugs, hue, bought, onPress }: Props) {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const off = card.sellers === 0 && !bought;
  const label = bought ? t("tabs.svb.cardBought", { name: card.title }) : off ? t("tabs.svb.cardOff", { name: card.title }) : t("tabs.svb.cardAria", { name: card.title, n: card.sellers });
  return (
    <PressableScale
      onPress={onPress}
      disabled={off}
      scale={0.97}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: off }}
      style={[s.row, !glass && shadows.s1, { backgroundColor: dark ? c.surface : brand.white }, off && s.off]}
    >
      <View style={[s.ico, { backgroundColor: dark ? c.surface2 : hue.bg }]}><CategoryIcon slugs={slugs} size={20} color={dark ? c.accent : hue.fg} /></View>
      <View style={s.body}>
        <Text variant="h4" numberOfLines={2} style={s.title}>{card.title}</Text>
        {category ? <Text variant="caption" tone="gray" numberOfLines={1} style={s.sub}>{category}</Text> : null}
        <View style={s.meta}>
          {card.basePrice > 0 ? <Text variant="small" weight="bold">{t("tabs.svb.price", { price: fmtMoney(card.basePrice) })}</Text> : null}
          {bought ? (
            <View style={s.fact}>
              <Icon name="check" size={13} color={c.ok} />
              <Text variant="caption" weight="bold" style={[s.sub, { color: c.ok }]}>{t("tabs.svb.bought")}</Text>
            </View>
          ) : (
            <View style={s.fact}>
              <Icon name="users" size={13} tone="gray" />
              <Text variant="caption" tone="gray" style={s.sub}>{off ? t("tabs.svb.noSellers") : t("tabs.svb.sellers", { n: card.sellers })}</Text>
            </View>
          )}
        </View>
      </View>
      {off ? null : <View style={[s.more, { backgroundColor: c.surface2 }]}><ChevronRight size={14} color={c.gray} /></View>}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.rl },
  off: { opacity: 0.6 },
  ico: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontSize: 15, lineHeight: 20 },
  sub: { fontSize: 12, lineHeight: 16 },
  meta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 10, rowGap: 2, marginTop: 4 },
  fact: { flexDirection: "row", alignItems: "center", gap: 4 },
  more: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
