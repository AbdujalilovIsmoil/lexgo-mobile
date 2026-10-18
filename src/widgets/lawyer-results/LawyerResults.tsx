import { FlatList, StyleSheet, View } from "react-native";
import type { UseInfiniteQueryResult, InfiniteData } from "@tanstack/react-query";
import { MarketCard, LawyerCardSkeleton, type LawyerPage } from "@/entities/lawyer";
import { useLawyerFilterStore } from "@/features/lawyer-filter";
import { Button, EmptyState, ErrorView, Text } from "@/shared/ui";
import { useTabHeader } from "@/widgets/tab-page";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { AskSupport } from "./AskSupport";

type Props = { query: UseInfiniteQueryResult<InfiniteData<LawyerPage>>; header: React.ReactElement; onOpen: (id: string) => void; onReset: () => void };

// The result list. A new filter is a new query, so `isPending` swaps the cards
// for skeletons; "show more" appends the next server page.
export function LawyerResults({ query, header, onOpen, onReset }: Props) {
  const { t } = useT();
  const insets = useInsets();
  const top = useTabHeader(16);
  const q = useLawyerFilterStore((st) => st.filters.q);
  const { data, isPending, error, refetch, isRefetching, hasNextPage, fetchNextPage, isFetchingNextPage } = query;
  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  if (error) return <>{top}{header}<ErrorView error={error} onRetry={() => void refetch()} /></>;
  return (
    <FlatList
      data={isPending ? [] : items}
      keyExtractor={(l) => l.id || l.userId}
      renderItem={({ item }) => <MarketCard lawyer={item} onPress={() => onOpen(item.userId || item.id)} />}
      ListHeaderComponent={<View>{top}{header}<Text variant="small" tone="gray" style={s.count}>{data ? t("mkw.count", { n: total }) : " "}</Text></View>}
      ListEmptyComponent={isPending ? <View style={s.gap}>{[0, 1, 2].map((i) => <LawyerCardSkeleton key={i} />)}</View> : <View style={s.gap}><EmptyState icon="users" title={t("lawyers.empty")} text={q ? t("mk2.emptyTextAi") : undefined} actionLabel={t("flt.clear")} onAction={onReset} />{q ? <AskSupport /> : null}</View>}
      ListFooterComponent={hasNextPage ? <Button title={`${t("svc.showMore")} · ${Math.max(total - items.length, 0)}`} onPress={() => void fetchNextPage()} loading={isFetchingNextPage} variant="soft" full style={s.more} /> : null}
      ItemSeparatorComponent={() => <View style={s.sep} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 130 }}
      refreshing={isRefetching && !isPending && !isFetchingNextPage}
      onRefresh={() => void refetch()}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
}

const s = StyleSheet.create({
  count: { marginVertical: 10 },
  sep: { height: 12 },
  gap: { gap: 12 },
  more: { marginTop: 14 },
});
