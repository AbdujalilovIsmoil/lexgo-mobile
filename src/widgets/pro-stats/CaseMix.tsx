import { StyleSheet, View } from "react-native";
import { CASE_STATUSES, caseTint, useCases } from "@/entities/pro-cases";
import { shares } from "@/entities/pro-stats";
import { useT } from "@/shared/i18n";
import { tOr } from "@/shared/lib/pro/tOr";
import { radius } from "@/shared/theme";
import { Card, Skeleton, Text } from "@/shared/ui";
import { Block } from "./Block";

// Own cases by status: one stacked bar (segment width = share) and a legend with counts.
export function CaseMix() {
  const { t } = useT();
  const q = useCases();
  const cases = q.data ?? [];
  const items = CASE_STATUSES.map((st) => ({ st, label: tOr(t, `aw11.caseStatus.${st}`, st), value: cases.filter((c) => c.status === st).length, color: caseTint(st) })).filter((x) => x.value > 0);
  const sh = shares(items.map((i) => i.value));
  return (
    <Block title={t("aw9.cases")} right={items.length ? <Text variant="caption" tone="gray">{t("statUx.casesCount", { n: cases.length })}</Text> : undefined}>
      <Card style={s.card}>
        {q.isLoading ? (
          <><Skeleton height={14} round={7} /><Skeleton width="70%" height={14} /><Skeleton width="50%" height={14} /></>
        ) : !items.length ? (
          <Text variant="small" tone="gray">{t("statUx.casesNone")}</Text>
        ) : (
          <>
            <View style={s.bar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {items.map((i, k) => <View key={i.st} style={{ flex: sh[k], backgroundColor: i.color }} />)}
            </View>
            {items.map((i) => (
              <View key={i.st} style={s.row} accessible accessibilityLabel={`${i.label}: ${i.value}`}>
                <View style={[s.dot, { backgroundColor: i.color }]} />
                <Text variant="small" style={s.label} numberOfLines={1}>{i.label}</Text>
                <Text variant="small" weight="bold">{i.value}</Text>
              </View>
            ))}
          </>
        )}
      </Card>
    </Block>
  );
}

const s = StyleSheet.create({
  card: { padding: 16, gap: 12 },
  bar: { flexDirection: "row", height: 14, borderRadius: 7, overflow: "hidden", gap: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 28 },
  dot: { width: 10, height: 10, borderRadius: radius.pill },
  label: { flex: 1 },
});
