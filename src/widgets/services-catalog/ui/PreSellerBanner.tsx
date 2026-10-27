import { StyleSheet, View } from "react-native";
import { brand, radius, useColors } from "@/shared/theme";
import { Avatar, Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { name: string; offered: Set<string> | null; narrowed: boolean; afterHours: boolean; onClear: () => void };

// An advocate chosen in the directory: the catalogue is narrowed to the services they offer.
export function PreSellerBanner({ name, offered, narrowed, afterHours, onClear }: Props) {
  const { t } = useT();
  const c = useColors();
  const line = narrowed ? t("csv.preSellerOnly", { n: offered?.size ?? 0 }) : offered && !offered.size ? t("csv.preSellerNoList") : t("csv.preSellerLead");
  return (
    <View style={[s.card, { backgroundColor: c.tint, borderColor: c.line }]}>
      <View style={[s.bar, { backgroundColor: brand.b600 }]} />
      <Avatar name={name || "A"} size={44} />
      <View style={s.col}>
        <Text variant="small" weight="bold" numberOfLines={2}>{t("csv.preSellerTitle", { name: name || t("csv.preSellerAnon") })}</Text>
        <Text variant="caption" tone="gray">{line}{afterHours ? ` ${t("csv.afterHours")}` : ""}</Text>
      </View>
      <PressableScale onPress={onClear} hitSlop={10} accessibilityRole="button" accessibilityLabel={t("csv.preSellerClear")} style={[s.x, { backgroundColor: c.surface }]}>
        <Icon name="x" size={16} tone="gray" />
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingRight: 12, paddingLeft: 18, borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  bar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5 },
  col: { flex: 1, gap: 2 },
  x: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
