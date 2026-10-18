import { View } from "react-native";
import { useMyKpis } from "@/entities/admin-hrm";
import { ProgressBar, QueryBoundary, SectionCard } from "@/shared/ui/admin";
import { Gauge, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// My KPIs for the current period: a gauge with the overall score and one bar per metric.
export function ProfileKpis() {
  const { t } = useT();
  const q = useMyKpis();
  const k = q.data;
  const score = Math.round(k?.score ?? 0);
  return (
    <SectionCard title={t("admHrm.myKpis")}>
      <QueryBoundary query={q}>
        {k?.items.length ? (
          <>
            <View style={{ alignItems: "center" }}>
              <Gauge value={score / 100} text={`${score}`} label={`${t("admHrmW.score")} · ${k.period}`} color={score >= 70 ? "#22C55E" : score >= 40 ? "#F59E0B" : "#EF4444"} />
            </View>
            {k.items.map((x) => (
              <View key={x.id} style={{ gap: 5 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                  <Text variant="small" weight="semibold" style={{ flex: 1 }} numberOfLines={1}>{x.title}</Text>
                  <Text variant="small" weight="bold">{x.actual} / {x.target}</Text>
                </View>
                <ProgressBar value={x.score / 100} />
              </View>
            ))}
          </>
        ) : <Text variant="small" tone="gray">{t("admHrm.noKpis")}</Text>}
      </QueryBoundary>
    </SectionCard>
  );
}
