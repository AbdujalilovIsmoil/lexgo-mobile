import { useRouter } from "expo-router";
import { useActivePromos, useAnalytics, usePending, usePromoStatus, usePromotionLive } from "@/entities/promotion";
import { useSession } from "@/entities/session";
import { AnalyticsCard, PendingList, RunningList } from "@/widgets/promotion";
import { IconButton, Skeleton } from "@/shared/ui";
import { AdminPage, QueryBoundary } from "@/shared/ui/admin";
import { PageScroll } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";

// Promotions (TZ 20): what is running, what waits for the Telegram approval, and how it performs.
export default function PromotionsPage() {
  const { t } = useT();
  const router = useRouter();
  const uid = useSession()?.user.id ?? "";
  const status = usePromoStatus();
  const stats = useAnalytics();
  const pending = usePending(uid);
  const live = useActivePromos(uid);
  usePromotionLive(uid);
  return (
    <AdminPage title={t("nav1.menu.promotions")} right={<IconButton icon="plus" onPress={() => router.push("/pro/promotions/new")} />}>
      <QueryBoundary query={status}>
        <PageScroll onRefresh={() => void Promise.all([status.refetch(), stats.refetch(), live.refetch()])} refreshing={status.isRefetching}>
          <PendingList items={pending.pending} />
          <RunningList items={status.data?.items ?? []} liveIds={new Set((live.data ?? []).map((x) => x.id))} />
          {stats.isLoading ? <Skeleton height={220} round={20} /> : stats.data ? <AnalyticsCard data={stats.data} spend={(status.data?.items ?? []).reduce((n, x) => n + x.price, 0)} /> : null}
        </PageScroll>
      </QueryBoundary>
    </AdminPage>
  );
}
