import { View } from "react-native";
import { Button, EmptyState, ErrorView, Skeleton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { WorkRow, useWorkload, type WorkItem } from "@/entities/organization";

// Finished orders of the members (GET …/owner/workload?status=completed), a page at a time.
export function CompletedList({ orgId, names, onOpen }: { orgId: string; names: Map<string, string>; onOpen: (w: WorkItem) => void }) {
  const { t } = useT();
  const { items, query } = useWorkload(orgId, "", "completed");
  if (query.isLoading) return <Skeleton height={76} round={20} />;
  if (query.isError) return <ErrorView error={query.error} onRetry={() => void query.refetch()} compact />;
  if (!items.length) return <EmptyState compact icon="check-circle" title={t("og2.noCompleted")} />;
  return (
    <View style={{ gap: 10 }}>
      {items.map((w) => <WorkRow key={w.id} item={w} memberName={names.get(w.memberUserId)} onPress={() => onOpen(w)} />)}
      {query.hasNextPage ? <Button title={t("adm.loadMore")} variant="soft" full loading={query.isFetchingNextPage} onPress={() => void query.fetchNextPage()} /> : null}
    </View>
  );
}
