import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { orderNumber, useMarketOrder, useMarketSync, useServiceOrder } from "@/entities/order";
import { useIsAuthed } from "@/entities/session";
import { DetailActions, MarketOrderDetail, ServiceOrderDetail } from "@/widgets/order-detail";
import { EmptyState, ErrorView, Skeleton } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// /orders/[id]: a marketplace purchase (by order id or ADV number) or, failing
// that, a catalogue service order. Live: socket events refresh it, pull to refresh too.
export function OrderDetailPage() {
  const { t } = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const authed = useIsAuthed();
  useMarketSync();
  const market = useMarketOrder(id, authed);
  const service = useServiceOrder(market.isSuccess && !market.data ? id : "");
  const order = market.data;
  const refresh = () => {
    void market.refetch();
    void qc.invalidateQueries({ queryKey: ["market-history"] });
  };
  const title = order ? orderNumber(order) : service.data?.workId || t("mk4.detail");
  const loading = market.isLoading || (market.isSuccess && !order && service.isLoading);
  const body = !authed ? <EmptyState icon="lock" title={t("mk4.loginTitle")} actionLabel={t("auth.submit")} onAction={() => router.push("/auth/login")} />
    : loading ? <View style={{ padding: 16, gap: 12 }}><Skeleton height={150} round={20} /><Skeleton height={80} round={20} /><Skeleton height={180} round={20} /></View>
    : order ? <MarketOrderDetail order={order} refreshing={market.isRefetching} onRefresh={refresh} />
    : service.data ? <ServiceOrderDetail order={service.data} onDone={() => router.back()} />
    : market.isError ? <ErrorView error={market.error} onRetry={() => void market.refetch()} />
    : <EmptyState icon="search" title={t("mk4.notFound")} actionLabel={t("mk4.title")} onAction={() => router.replace("/(tabs)/orders")} />;
  return <AdminPage title={title} subtitle={order?.serviceTitle} footer={order ? <DetailActions order={order} /> : undefined}>{body}</AdminPage>;
}
