import { StyleSheet, View } from "react-native";
import { PERIOD_KEY, planPerMonth, planSavingPct, planTotal, type BillingPeriod, type Plan } from "@/entities/plan";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { brand, useColors } from "@/shared/theme";
import { fmtMoney } from "@/shared/lib/money";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

type Props = { plan: Plan; periods: BillingPeriod[]; value: BillingPeriod; onChange: (p: BillingPeriod) => void };

// The periods a plan sells as a two-column grid of tiles: name, the total for that period, the average per month and a
// green saving badge (against paying month by month). The chosen tile also gets a blue border, a tint and a check.
export function PeriodTiles({ plan, periods, value, onChange }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.grid}>
      {periods.map((p) => {
        const on = p === value;
        const save = planSavingPct(plan, p);
        return (
          <PressableScale key={p} haptic={false} scale={0.97} onPress={() => { if (!on) { selectHaptic(); onChange(p); } }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.tile, { borderColor: on ? brand.b600 : c.line, backgroundColor: on ? c.tint : c.surface, borderWidth: on ? 2 : 1.5 }]}>
            <View style={s.top}>
              <Text variant="small" weight="bold">{t(PERIOD_KEY[p])}</Text>
              <View style={s.mark}>
                {save ? <View style={[s.badge, { backgroundColor: c.okBg }]}><Text variant="caption" weight="bold" style={{ color: c.ok }}>{t("ntd.tgSavePct", { n: save })}</Text></View> : null}
                {on ? <Icon name="check-circle" size={18} color={brand.b600} /> : null}
              </View>
            </View>
            <Text variant="body" weight="bold" numberOfLines={1} adjustsFontSizeToFit>{fmtMoney(planTotal(plan, p))}</Text>
            <Text variant="caption" tone="gray" numberOfLines={1}>{p === "monthly" ? t("common.currency") : t("ntd.tgAvg", { price: fmtMoney(planPerMonth(plan, p)) })}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { flexGrow: 1, flexBasis: "46%", borderRadius: 18, padding: 12, gap: 2, minHeight: 92 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 22 },
  mark: { flexDirection: "row", alignItems: "center", gap: 6 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
});
