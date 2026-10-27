import { StyleSheet, View } from "react-native";
import { PERIOD_KEY, usePlanQuote, type BillingPeriod, type Plan } from "@/entities/plan";
import { Icon, PressableScale, Skeleton, Text } from "@/shared/ui";
import { brand, useColors } from "@/shared/theme";
import { fmtMoney } from "@/shared/lib/money";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

type Props = { plan: Plan; periods: BillingPeriod[]; value: BillingPeriod; onChange: (p: BillingPeriod) => void };

function Tile({ plan, period, on, onPress }: { plan: Plan; period: BillingPeriod; on: boolean; onPress: () => void }) {
  const { t } = useT();
  const c = useColors();
  const q = usePlanQuote(plan.id, period, plan.monthlyPrice > 0);
  const quote = q.data;
  const off = quote && quote.discount > 0 ? quote : null;
  return (
    <PressableScale haptic={false} scale={0.97} onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.tile, { borderColor: on ? brand.b600 : c.line, backgroundColor: on ? c.tint : c.surface, borderWidth: on ? 2 : 1.5 }]}>
      <View style={s.top}>
        <Text variant="small" weight="bold" numberOfLines={1} style={s.flex}>{t(PERIOD_KEY[period])}</Text>
        {on ? <Icon name="check-circle" size={18} color={brand.b600} /> : null}
      </View>
      {q.isPending && plan.monthlyPrice > 0 ? <Skeleton width="70%" height={20} round={8} /> : (
        <Text variant="body" weight="bold" numberOfLines={1} adjustsFontSizeToFit>{quote ? fmtMoney(quote.amount) : plan.monthlyPrice > 0 ? "—" : t("cs.free")}</Text>
      )}
      {off ? (
        <View style={s.mark}>
          <Text variant="caption" tone="gray2" numberOfLines={1} style={s.was}>{fmtMoney(off.base)}</Text>
          <View style={[s.badge, { backgroundColor: c.okBg }]}><Icon name="tag" size={10} color={c.ok} /><Text variant="caption" weight="bold" numberOfLines={1} style={{ color: c.ok }}>{t("subq.price.off", { sum: fmtMoney(off.discount) })}</Text></View>
        </View>
      ) : <Text variant="caption" tone="gray" numberOfLines={1}>{t("common.currency")}</Text>}
    </PressableScale>
  );
}

// The periods a plan sells as a two-column grid of tiles: name and the backend's quote for that period (with a running campaign, the
// discount badge and the base crossed out). The chosen tile also gets a blue border, a tint and a check.
export function PeriodTiles({ plan, periods, value, onChange }: Props) {
  return (
    <View style={s.grid}>
      {periods.map((p) => <Tile key={p} plan={plan} period={p} on={p === value} onPress={() => { if (p !== value) { selectHaptic(); onChange(p); } }} />)}
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { flexGrow: 1, flexBasis: "46%", borderRadius: 18, padding: 12, gap: 2, minHeight: 92 },
  top: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 22 },
  flex: { flex: 1 },
  mark: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  badge: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1 },
  was: { textDecorationLine: "line-through" },
});
