import type { ReactElement } from "react";
import { FlatList, View } from "react-native";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { Button } from "../Button";
import { EmptyState } from "../EmptyState";
import { ErrorView } from "../ErrorView";
import { Skeleton } from "../Skeleton";
import { ApiError } from "@/shared/api/errors";
import type { IconName } from "../Icon";

type Q = { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown; isRefetching: boolean; hasNextPage?: boolean; fetchNextPage?: () => unknown; isFetchingNextPage?: boolean };
type Props<T> = {
  data: T[];
  query: Q;
  renderItem: (item: T, index: number) => ReactElement;
  keyExtractor: (item: T) => string;
  header?: ReactElement | null;
  empty?: { icon?: IconName; title: string; text?: string };
  skeletonHeight?: number;
  /** Space under the last row; tab pages pass `useTabPad()` so it clears the floating tab bar. */
  bottomPad?: number;
  /** Shown instead of the error when the server answers 404 (module switched off). */
  off?: { title: string; text?: string };
};

// PagedList for bottom-tab pages: same skeleton → error → rows flow, plus a bottom padding the tab bar can float over.
export function TabList<T>({ data, query, renderItem, keyExtractor, header, empty, skeletonHeight = 84, bottomPad, off }: Props<T>) {
  const { t } = useT();
  const insets = useInsets();
  const pending = query.isLoading ? <View style={{ gap: 12 }}>{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={skeletonHeight} round={20} />)}</View> : null;
  return (
    <FlatList
      data={query.isLoading || query.isError ? [] : data}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => renderItem(item, index)}
      ListHeaderComponent={header}
      ListEmptyComponent={pending ?? (query.isError ? (off && query.error instanceof ApiError && query.error.status === 404 ? <EmptyState icon="power" title={off.title} text={off.text} /> : <ErrorView error={query.error} onRetry={() => void query.refetch()} />) : <EmptyState icon={empty?.icon ?? "inbox"} title={empty?.title ?? t("adm.noData")} text={empty?.text} />)}
      ListFooterComponent={query.hasNextPage ? <Button title={t("adm.loadMore")} variant="soft" full loading={query.isFetchingNextPage} onPress={() => void query.fetchNextPage?.()} style={{ marginTop: 12 }} /> : null}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad ?? insets.bottom + 24, flexGrow: 1 }}
      refreshing={query.isRefetching && !query.isFetchingNextPage}
      onRefresh={() => void query.refetch()}
      onEndReachedThreshold={0.4}
      onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && void query.fetchNextPage?.()}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
}
