import { StyleSheet, View } from "react-native";
import { Pill, PressableScale, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import type { LawyerService } from "@/entities/lawyer";

type Props = { service: LawyerService; selected: boolean; onSelect: () => void };

// One service in "Xizmatlar va narxlar" (Adliya .opt): the title with the category / the specialist's note under it on the left, the price
// on the right. Tapping picks it (blue edge on the soft blue); the one "Sotib olish" lives in the bottom bar.
export function ServiceOption({ service: sv, selected, onSelect }: Props) {
  const { colors: c, dark, glass } = useTheme();
  const { t } = useT();
  const sub = [sv.category, sv.note].filter(Boolean);
  const idle = { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E2E8F1" };
  return (
    <PressableScale haptic={false} scale={0.99} onPress={() => { selectHaptic(); onSelect(); }} accessibilityRole="radio" accessibilityState={{ selected }} style={[s.card, selected ? { backgroundColor: c.tint2, borderColor: c.accent } : idle]}>
      <View style={s.col}>
        {sv.sponsored ? <View style={s.tag}><Pill label={t("promoSeller.ck.sponsored")} tone="cy" icon="trending-up" small /></View> : null}
        <Text variant="body" weight="bold" numberOfLines={3} style={s.title}>{sv.title}</Text>
        {sub.map((x) => <Text key={x} variant="small" tone="gray" numberOfLines={2} style={s.sub}>{x}</Text>)}
      </View>
      <Text variant="body" weight="bold" tone={sv.price ? "ink" : "gray2"} style={s.price}>{sv.price ? fmtMoney(sv.price) : t("mk2.priceAsk")}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  col: { flex: 1, minWidth: 0, gap: 2 },
  tag: { alignSelf: "flex-start", marginBottom: 2 },
  title: { fontSize: 15.5, lineHeight: 21 },
  sub: { fontSize: 13.5, lineHeight: 18 },
  price: { fontSize: 15.5, lineHeight: 21, maxWidth: "40%", textAlign: "right" },
});
