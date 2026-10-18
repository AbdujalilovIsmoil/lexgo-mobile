import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { StepKey } from "./steps";

const LABEL = { place: "sPlace", package: "sPackage", banner: "sBanner", confirm: "sConfirm" } as const;

// Progress header: one segment per step (filled up to the current one) with «1 Joy · 2 Paket …» under it; done steps are ticked.
// Announced as a single progress item to screen readers.
export function StepHeader({ steps, current }: { steps: StepKey[]; current: StepKey }) {
  const { t } = useT();
  const c = useColors();
  const at = steps.indexOf(current);
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={`${t(`promoSeller.ck.${LABEL[current]}`)}. ${t("promoSeller.ck.stepOf", { n: at + 1, m: steps.length })}`} style={s.row}>
      {steps.map((k, i) => (
        <View key={k} style={s.step}>
          <View style={[s.bar, { backgroundColor: i <= at ? c.accent : c.line }]} />
          <View style={s.label}>
            {i < at ? <Icon name="check" size={13} color={c.accent} /> : <Text variant="caption" weight="bold" tone={i === at ? "accent" : "gray2"}>{i + 1}</Text>}
            <Text variant="caption" weight={i === at ? "bold" : "regular"} tone={i === at ? "ink" : "gray"} numberOfLines={1}>{t(`promoSeller.ck.${LABEL[k]}`)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  step: { flex: 1, gap: 6 },
  bar: { height: 4, borderRadius: 2 },
  label: { flexDirection: "row", alignItems: "center", gap: 4 },
});
