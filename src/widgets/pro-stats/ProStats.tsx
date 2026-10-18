import { RefreshControl, ScrollView } from "react-native";
import { useStats } from "@/entities/pro-workspace";
import { isForbidden } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { EmptyState, ErrorView } from "@/shared/ui";
import { CaseMix } from "./CaseMix";
import { Payouts } from "./Payouts";
import { Performance } from "./Performance";
import { Tiles } from "./Tiles";

// Professional statistics from GET /lawyers/me/stats: workload, finance, performance, cases by status.
export function ProStats() {
  const { t } = useT();
  const insets = useInsets();
  const q = useStats();
  if (q.isError) return isForbidden(q.error) ? <EmptyState icon="lock" title={t("aw9.forbidden")} /> : <ErrorView error={q.error} onRetry={() => void q.refetch()} />;
  const d = q.data;
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 40 }} refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} />} showsVerticalScrollIndicator={false}>
      <Tiles kind="w" data={d?.workload ?? {}} loading={q.isLoading} />
      <Tiles kind="f" data={d?.finance ?? {}} loading={q.isLoading} />
      <Performance stats={d} loading={q.isLoading} />
      <Payouts />
      <CaseMix />
    </ScrollView>
  );
}
