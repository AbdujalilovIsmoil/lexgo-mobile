import type { ReactElement } from "react";
import { FlatList, View } from "react-native";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { Button } from "../Button";
import { Divider } from "../Divider";
import { EmptyState } from "../EmptyState";
import { ErrorView } from "../ErrorView";
import { ApiError } from "@/shared/api/errors";
import { Skeleton } from "../Skeleton";
import type { IconName } from "../Icon";
import { usePullRefresh } from "@/shared/lib/usePullRefresh";

type Q = { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown; isRefetching: boolean; hasNextPage?: boolean; fetchNextPage?: () => unknown; isFetchingNextPage?: boolean };
type Props<T> = {
  data: T[];
  query: Q;
  renderItem: (item: T, index: number) => ReactElement;
  keyExtractor: (item: T) => string;
  header?: ReactElement | null;
  empty?: { icon?: IconName; title: string; text?: string; actionLabel?: string; onAction?: () => void };
  skeletonHeight?: number;
  off?: { title: string; text?: string };
  columns?: number; // a grid of equal cells (rows are laid out by the caller's item width)
  flat?: boolean; // rows without a gap between them (they carry their own hairlines)
  bottomPad?: number; // extra room under the last row (a floating button)
};

// Infinite admin list: skeleton → error/403 (404 = module off when `off` is given) → rows, pull to refresh, "show more".
export function PagedList<T>({ data, query, renderItem, keyExtractor, header, empty, skeletonHeight = 84, off, flat, columns = 1, bottomPad = 0 }: Props<T>) {
  const { t } = useT();
  const pull = usePullRefresh(() => query.refetch());
  const insets = useInsets();
  const pending = query.isLoading ? <View style={{ gap: 12 }}>{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={skeletonHeight} round={20} />)}</View> : null;
  return (
    <FlatList
      key={columns}
      numColumns={columns}
      columnWrapperStyle={columns > 1 ? { gap: 14, justifyContent: columns > 2 ? "flex-start" : "space-between" } : undefined}
      data={query.isLoading || (query.isError && !data.length) ? [] : data} // a failed background refetch keeps the rows already shown
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => renderItem(item, index)}
      ListHeaderComponent={header}
      ListEmptyComponent={pending ?? (query.isError ? (off && query.error instanceof ApiError && query.error.status === 404 ? <EmptyState icon="power" title={off.title} text={off.text} /> : <ErrorView error={query.error} onRetry={() => void query.refetch()} />) : <EmptyState icon={empty?.icon ?? "inbox"} title={empty?.title ?? t("adm.noData")} text={empty?.text} actionLabel={empty?.actionLabel} onAction={empty?.onAction} />)}
      ListFooterComponent={query.hasNextPage ? <Button title={t("adm.loadMore")} variant="soft" full loading={query.isFetchingNextPage} onPress={() => void query.fetchNextPage?.()} style={{ marginTop: 12 }} /> : null}
      ItemSeparatorComponent={() => (flat ? <Divider inset={56} /> : <View style={{ height: columns > 1 ? 20 : 10 }} />)}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 + bottomPad, flexGrow: 1 }}
      refreshing={pull.refreshing}
      onRefresh={pull.onRefresh}
      onEndReachedThreshold={0.4}
      onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && void query.fetchNextPage?.()}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
}
