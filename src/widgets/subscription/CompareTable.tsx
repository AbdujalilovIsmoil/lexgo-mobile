import { View } from "react-native";
import { aiLimit, type Plan } from "@/entities/plan";
import { Card, Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// Price / AI requests / number of features, one column per LexGo.AI tariff.
export function CompareTable({ plans }: { plans: Plan[] }) {
  const { t } = useT();
  const rows = [
    { label: t("cs.cmpPrice"), cells: plans.map((p) => (p.monthlyPrice ? `${fmtMoney(p.monthlyPrice)} ${t("cs.perMonth")}` : t("cs.free"))) },
    { label: t("cs.cmpReq"), cells: plans.map((p) => String(aiLimit(p) || "—")) },
    { label: t("cs.cmpFeat"), cells: plans.map((p) => String(p.features.length || "—")) },
  ];
  return (
    <Card style={{ gap: 10 }}>
      <Text variant="h4">{t("cs.cmpT")}</Text>
      {rows.map((r) => (
        <View key={r.label} style={{ gap: 4 }}>
          <Text variant="caption" tone="gray">{r.label}</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {r.cells.map((c, i) => (
              <View key={plans[i].id} style={{ flex: 1 }}>
                <Text variant="caption" tone="gray2" numberOfLines={1}>{plans[i].name}</Text>
                <Text variant="small" weight="bold">{c}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </Card>
  );
}
