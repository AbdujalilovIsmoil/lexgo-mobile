import { FlatList, StyleSheet, View } from "react-native";
import { EmptyState, ErrorView, Skeleton, Text } from "@/shared/ui";
import { usePullRefresh } from "@/shared/lib/usePullRefresh";
import { useT } from "@/shared/i18n";
import { useTabHeader } from "@/widgets/tab-page";
import { RequestCard } from "./RequestCard";
import { useActiveRequests } from "./useActiveRequests";

// Every active request of the client, behind Home's "Barchasi": the same two cards without Home's limits. When only one source fails,
// the other one still shows and the error sits under it. `lead`: a line above the cards, spaced off the page header.
export function ActiveRequestsList({ bottom, lead }: { bottom: number; lead?: string }) {
  const { t } = useT();
  const a = useActiveRequests();
  const top = useTabHeader(16);
  const pull = usePullRefresh(a.refetch);
  const cards = [{ key: "urgent", rows: a.urgent }, { key: "cases", rows: a.open }].filter((x) => x.rows.length);
  const empty = a.anyLoading ? <Skeleton height={72} round={20} />
    : a.bothFailed ? <ErrorView error={a.error} onRetry={() => void a.refetch()} />
    : a.error ? null
    : <EmptyState icon="star" title={t("cdash.emptyTitle")} text={t("cdash.emptyText")} compact />;
  return (
    <FlatList
      data={cards}
      keyExtractor={(x) => x.key}
      renderItem={({ item }) => <RequestCard rows={item.rows} />}
      ListHeaderComponent={<View>{top}{lead ? <Text variant="small" tone="gray" style={s.lead}>{lead}</Text> : null}</View>}
      ListEmptyComponent={empty}
      ListFooterComponent={a.error && !a.bothFailed ? <ErrorView error={a.error} onRetry={() => void a.refetch()} compact /> : null}
      ItemSeparatorComponent={() => <View style={s.sep} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottom }}
      refreshing={pull.refreshing}
      onRefresh={pull.onRefresh}
      showsVerticalScrollIndicator={false}
    />
  );
}

const s = StyleSheet.create({
  sep: { height: 10 },
  lead: { paddingTop: 16, paddingBottom: 14 },
});
