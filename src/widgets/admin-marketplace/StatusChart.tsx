import { View } from "react-native";
import { Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { statusColor, useMktLabels, type MktStats } from "@/entities/admin-marketplace";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const ORDER = ["completed", "paid", "pending_payment", "cancelled"];

// Orders by status as one stacked bar with a legend (count and share per status).
export function StatusChart({ stats }: { stats: MktStats }) {
  const { t } = useT();
  const c = useColors();
  const label = useMktLabels();
  const known = new Map(stats.byStatus.map((x) => [x.status, x.count]));
  const keys = [...ORDER, ...stats.byStatus.map((x) => x.status).filter((x) => !ORDER.includes(x))];
  const total = keys.reduce((n, k) => n + (known.get(k) ?? 0), 0);
  return (
    <SectionCard title={t("admMkt.chart.title")}>
      <Text variant="caption" tone="gray">{t("admMkt.chart.total", { n: stats.ordersTotal })}</Text>
      {total ? (
        <>
          <View style={{ flexDirection: "row", height: 16, borderRadius: 8, overflow: "hidden", backgroundColor: c.surface2, gap: 2 }}>
            {keys.filter((k) => known.get(k)).map((k) => <View key={k} style={{ flex: known.get(k), backgroundColor: statusColor(k) }} />)}
          </View>
          {keys.map((k) => (
            <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 8, opacity: known.get(k) ? 1 : 0.45 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: statusColor(k) }} />
              <Text variant="small" style={{ flex: 1 }}>{label.status(k)}</Text>
              <Text variant="small" weight="bold">{known.get(k) ?? 0}</Text>
              <Text variant="caption" tone="gray" style={{ width: 48, textAlign: "right" }}>{Math.round(((known.get(k) ?? 0) / total) * 1000) / 10}%</Text>
            </View>
          ))}
        </>
      ) : (
        <Text variant="small" tone="gray">{t("admMkt.chart.empty")}</Text>
      )}
    </SectionCard>
  );
}
