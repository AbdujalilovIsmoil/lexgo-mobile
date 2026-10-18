import type { ReactElement } from "react";
import { FlatList, View } from "react-native";
import { useT } from "@/shared/i18n";
import { Button } from "../Button";
import { EmptyState } from "../EmptyState";
import { ErrorView } from "../ErrorView";
import { Skeleton } from "../Skeleton";
import type { IconName } from "../Icon";

type Q = { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown; isRefetching: boolean; hasNextPage?: boolean; fetchNextPage?: () => unknown; isFetchingNextPage?: boolean };
type Props<T> = {
  data: T[];
  query: Q;
  renderItem: (item: T, index: number) => ReactElement;
  keyExtractor: (item: T) => string;
  header?: ReactElement | null;
  empty?: { icon?: IconName; title: string; text?: string };
  bottomPad: number; // useTabPad() — keeps the last row clear of the floating tab bar
  skeletonHeight?: number;
};

// PagedList for bottom-tab pages: same states (skeleton → error → rows, refresh, "show more")
// with a bottom padding that clears the floating tab bar.
export function TabList<T>({ data, query, renderItem, keyExtractor, header, empty, bottomPad, skeletonHeight = 84 }: Props<T>) {
  const { t } = useT();
  const pending = query.isLoading ? <View style={{ gap: 12 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={skeletonHeight} round={20} />)}</View> : null;
  return (
    <FlatList
      data={query.isLoading || query.isError ? [] : data}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => renderItem(item, index)}
      ListHeaderComponent={header}
      ListEmptyComponent={pending ?? (query.isError ? <ErrorView error={query.error} onRetry={() => void query.refetch()} /> : <EmptyState icon={empty?.icon ?? "inbox"} title={empty?.title ?? t("adm.noData")} text={empty?.text} />)}
      ListFooterComponent={query.hasNextPage ? <Button title={t("adm.loadMore")} variant="soft" full loading={query.isFetchingNextPage} onPress={() => void query.fetchNextPage?.()} style={{ marginTop: 12 }} /> : null}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad, flexGrow: 1 }}
      refreshing={query.isRefetching && !query.isFetchingNextPage}
      onRefresh={() => void query.refetch()}
      onEndReachedThreshold={0.4}
      onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && void query.fetchNextPage?.()}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
}
