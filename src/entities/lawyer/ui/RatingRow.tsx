import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { Lawyer } from "../model/types";

// "★ 4.9 · 128 ta baho · 12 yil tajriba" (or the "not rated yet" hint).
export function RatingRow({ lawyer }: { lawyer: Lawyer }) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={s.row}>
      {lawyer.rated ? (
        <View style={[s.badge, { backgroundColor: c.okBg }]}>
          <Icon name="star" size={12} color={c.ok} />
          <Text variant="caption" weight="bold" style={{ color: c.ok }}>
            {lawyer.rating.toFixed(1)}
          </Text>
        </View>
      ) : (
        <View style={[s.badge, { backgroundColor: c.surface2 }]}>
          <Text variant="caption" tone="gray" weight="semibold">
            {t("lawyers.card.unrated")}
          </Text>
        </View>
      )}
      <Text variant="caption" tone="gray" numberOfLines={1} style={s.meta}>
        {t("lawyers.card.reviews", { count: lawyer.reviews, years: lawyer.experienceYears })}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 8 },
  meta: { flexShrink: 1 },
});
