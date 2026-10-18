import { View } from "react-native";
import { Card, Text } from "@/shared/ui";
import type { MktStats } from "@/entities/admin-marketplace";
import { fmtMoney } from "@/shared/lib/money";
import { fmtTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// Live revenue banner: paid revenue for the current scope, the paid-order count and the last refresh time.
export function RevenueHero({ stats, updatedAt, scope }: { stats?: MktStats; updatedAt: number; scope: string }) {
  const { t } = useT();
  return (
    <Card tinted style={{ gap: 4 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text variant="kicker" tone="gray">{t("admMkt.revenue")}</Text>
        {updatedAt ? <Text variant="caption" tone="gray2">{t("admMkt.updated", { time: fmtTime(new Date(updatedAt).toISOString()) })}</Text> : null}
      </View>
      <Text variant="h2" numberOfLines={1} adjustsFontSizeToFit>{stats ? `${fmtMoney(stats.revenuePaid)} ${t("adm.currency")}` : "—"}</Text>
      <Text variant="small" tone="gray">{stats ? t("admMkt.revenueSub", { n: stats.paidOrders }) : " "}</Text>
      <Text variant="caption" tone="gray2" numberOfLines={2}>{scope}</Text>
    </Card>
  );
}
