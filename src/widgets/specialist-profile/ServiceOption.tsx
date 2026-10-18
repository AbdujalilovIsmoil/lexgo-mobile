import { StyleSheet, View } from "react-native";
import { PressableScale, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import type { LawyerService } from "@/entities/lawyer";

type Props = { service: LawyerService; selected: boolean; onSelect: () => void };

// One service in "Xizmatlar va narxlar": a radio dot, title, category, the specialist's note, a dashed line and the price.
// Tapping picks it (outlined and tinted); the one "Sotib olish" lives in the bottom bar.
export function ServiceOption({ service: sv, selected, onSelect }: Props) {
  const c = useColors();
  const { t } = useT();
  return (
    <PressableScale haptic={false} onPress={() => { selectHaptic(); onSelect(); }} accessibilityRole="radio" accessibilityState={{ selected }} style={[s.card, { backgroundColor: selected ? c.tint : c.surface2, borderColor: selected ? c.accent : "transparent" }]}>
      <View style={s.top}>
        <View style={[s.radio, { borderColor: selected ? c.accent : c.gray2 }]}>{selected ? <View style={[s.dot, { backgroundColor: c.accent }]} /> : null}</View>
        <View style={s.col}>
          <Text variant="body" weight="bold" numberOfLines={3}>{sv.title}</Text>
          {sv.category ? <Text variant="small" tone="gray">{sv.category}</Text> : null}
          {sv.note ? <Text variant="small" tone="gray">{sv.note}</Text> : null}
        </View>
      </View>
      <View style={[s.foot, { borderTopColor: c.line }]}>
        <Text variant="h4" tone={sv.price ? "ink" : "gray2"}>{sv.price ? fmtMoney(sv.price) : t("mk2.priceAsk")}</Text>
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { gap: 14, padding: 14, borderRadius: radius.rl, borderWidth: 1.5 },
  top: { flexDirection: "row", gap: 12 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  col: { flex: 1, gap: 3 },
  foot: { flexDirection: "row", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderStyle: "dashed" },
});
