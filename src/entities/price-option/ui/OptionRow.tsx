import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import type { PriceOption } from "../model/types";

type Props = { option: PriceOption; on: boolean; disabled?: boolean; onPress: () => void };

// One checkbox choice (never a radio: every option may be combined). Shows "+25 000 so'm" or "+10%".
export function OptionRow({ option: o, on, disabled, onPress }: Props) {
  const c = useColors();
  const { t } = useT();
  const add = o.type === "percent" ? t("ntd.po.percent", { n: o.value }) : t("ntd.po.fixed", { n: fmtMoney(o.value) });
  return (
    <PressableScale onPress={onPress} disabled={disabled} scale={0.98} accessibilityRole="checkbox" accessibilityState={{ checked: on, disabled }} style={[s.row, { backgroundColor: on ? c.tint : c.surface, borderColor: on ? c.accent : c.line }]}>
      <View style={[s.box, { backgroundColor: on ? c.accent : "transparent", borderColor: on ? c.accent : c.gray2 }]}>{on ? <Icon name="check" size={14} color="#fff" /> : null}</View>
      <View style={s.col}>
        <Text variant="small" weight="bold">{o.label}</Text>
        {o.description ? <Text variant="caption" tone="gray">{o.description}</Text> : null}
      </View>
      <Text variant="small" weight="bold" tone="accent">{add}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, borderWidth: 1.5 },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 1 },
});
