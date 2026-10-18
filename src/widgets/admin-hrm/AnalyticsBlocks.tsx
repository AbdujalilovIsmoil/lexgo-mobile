import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import type { IconName } from "@/shared/ui";
import { Icon, Text } from "@/shared/ui";
import type { AnalyticsBlock } from "@/entities/admin-hrm";
import { BarList, SectionCard } from "@/shared/ui/admin";
import { humanizeSlug } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { AnalyticsHero } from "./AnalyticsHero";

const LOOK: Record<string, { icon: IconName; tint: string }> = {
  employees: { icon: "users", tint: "#06B6D4" }, attendance_today: { icon: "calendar", tint: "#22C55E" }, execution: { icon: "check-square", tint: "#F59E0B" },
  finance: { icon: "credit-card", tint: "#6366F1" }, support: { icon: "headphones", tint: "#EC4899" },
};

// GET /internal/analytics/dashboard: hero gauges, then one card per block — counters as bars, money as a big number.
export function AnalyticsBlocks({ blocks }: { blocks: AnalyticsBlock[] }) {
  const { t } = useT();
  const label = (key: string) => (t(`admHrmC.an.${key}`) !== `admHrmC.an.${key}` ? t(`admHrmC.an.${key}`) : humanizeSlug(key));
  return (
    <View style={{ gap: 12 }}>
      <AnalyticsHero blocks={blocks} />
      {blocks.map((b, i) => {
        const look = LOOK[b.key] ?? { icon: "bar-chart-2" as IconName, tint: "#6366F1" };
        const money = b.values.filter((v) => v.key.includes("amount"));
        return (
          <Animated.View key={b.key} entering={FadeInUp.delay(Math.min(i, 8) * 40)}>
            <SectionCard title={label(b.key)}>
              {money.map((v) => (
                <View key={v.key} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Icon name={look.icon} size={20} color={look.tint} />
                  <Text variant="h2" style={{ color: look.tint }}>{fmtMoney(v.value)} {t("adm.currency")}</Text>
                  <Text variant="caption" tone="gray">{label(v.key)}</Text>
                </View>
              ))}
              <BarList items={b.values.filter((v) => !v.key.includes("amount")).map((v) => ({ label: label(v.key), value: v.value, color: look.tint }))} />
            </SectionCard>
          </Animated.View>
        );
      })}
    </View>
  );
}
