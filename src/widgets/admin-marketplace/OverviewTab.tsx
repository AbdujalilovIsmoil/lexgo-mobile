import { RefreshControl, ScrollView, View } from "react-native";
import { OrderRow, useLatestOrders, useOverview, useTopSellers, type MktOrder, type MktSeller } from "@/entities/admin-marketplace";
import type { MktFilters } from "@/features/admin-marketplace";
import { QueryBoundary, SectionCard } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { MktFilterBar } from "./MktFilterBar";
import { RevenueHero } from "./RevenueHero";
import { StatsKpis } from "./StatsKpis";
import { StatusChart } from "./StatusChart";
import { TopSellers } from "./TopSellers";
import { useScopeText } from "./useScopeText";

type Props = { f: MktFilters; onStatus: (s: string) => void; onSeller: (s: MktSeller) => void; onTab: (tab: "orders" | "sellers") => void; onOpen: (o: MktOrder) => void };

// Overview tab: revenue, KPI tiles, status chart, top sellers and the latest orders.
export function OverviewTab({ f, onStatus, onSeller, onTab, onOpen }: Props) {
  const { t } = useT();
  const insets = useInsets();
  const overview = useOverview(f.scope);
  const top = useTopSellers(f.scope.dateFrom, f.scope.dateTo);
  const latest = useLatestOrders(f.scope);
  const scopeText = useScopeText(f);
  const busy = overview.isRefetching || top.isRefetching || latest.isRefetching;
  const refresh = () => void Promise.all([overview.refetch(), top.refetch(), latest.refetch()]);
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }} refreshControl={<RefreshControl refreshing={busy} onRefresh={refresh} />} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <MktFilterBar f={f} withParties />
      <QueryBoundary query={overview}>
        {overview.data ? (
          <View style={{ gap: 12 }}>
            <RevenueHero stats={overview.data} updatedAt={overview.dataUpdatedAt} scope={scopeText} />
            <StatsKpis stats={overview.data} onStatus={onStatus} onSellers={() => onTab("sellers")} />
            <StatusChart stats={overview.data} />
            <TopSellers sellers={top.data?.items ?? []} onSeller={onSeller} onAll={() => onTab("sellers")} />
            <SectionCard title={t("admMkt.latest.title")} action={{ label: t("admMkt.latest.all"), onPress: () => onTab("orders") }} padded={false}>
              <View style={{ padding: 12, gap: 10 }}>
                {(latest.data?.items ?? []).map((o) => <OrderRow key={o.id} item={o} onPress={() => onOpen(o)} />)}
                {latest.data && !latest.data.items.length ? <Text variant="small" tone="gray" center>{f.active ? t("admMkt.latest.emptyFiltered") : t("admMkt.latest.empty")}</Text> : null}
              </View>
            </SectionCard>
          </View>
        ) : null}
      </QueryBoundary>
    </ScrollView>
  );
}
