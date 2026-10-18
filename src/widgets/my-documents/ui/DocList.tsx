import type { ReactElement } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { EmptyState, ErrorView, Skeleton } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { sectionize, type DocRow } from "@/entities/my-document";
import type { PageInfo } from "@/features/my-documents";
import { DocListFooter } from "./DocListFooter";
import { DocListItem } from "./DocListItem";
import { DocSectionHead } from "./DocSectionHead";

type Q = { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown; isRefetching: boolean; hasNextPage?: boolean; fetchNextPage?: () => unknown; isFetchingNextPage?: boolean };
type Props = {
  rows: DocRow[];
  query: Q;
  page: PageInfo;
  filtered: boolean;
  header: ReactElement;
  onOpen: (id: string) => void;
  onSend: (id: string) => void;
  onReset: () => void;
  onBrowse: () => void;
};

// The list body: skeleton cards → error → empty / filtered-empty → sections of cards, pull to refresh, and ten more on
// scroll-end through the counter footer.
export function DocList({ rows, query, page, filtered, header, onOpen, onSend, onReset, onBrowse }: Props) {
  const { t } = useT();
  const insets = useInsets();
  const data = query.isLoading || query.isError ? [] : sectionize(rows);
  const empty = query.isLoading ? (
    <View style={s.gap}>{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={104} round={20} />)}</View>
  ) : query.isError ? (
    <ErrorView error={query.error} onRetry={() => void query.refetch()} />
  ) : (
    <EmptyState icon={filtered ? "search" : "file-text"} title={filtered ? t("dm1.filterEmpty") : t("dm1.empty")} text={filtered ? t("dm1.filterEmptyText") : t("dm1.emptyText")} actionLabel={filtered ? t("dm1.reset") : t("dm1.browse")} onAction={filtered ? onReset : onBrowse} />
  );
  return (
    <FlatList
      data={data}
      keyExtractor={(i) => i.id}
      renderItem={({ item, index }) => (item.head ? <DocSectionHead kind={item.head} n={item.n ?? 0} /> : item.row ? <DocListItem row={item.row} index={index} onOpen={onOpen} onSend={onSend} /> : <View />)}
      ItemSeparatorComponent={() => <View style={s.sep} />}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ListFooterComponent={data.length ? <DocListFooter page={page} loading={!!query.isFetchingNextPage} onMore={() => void query.fetchNextPage?.()} /> : null}
      contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 28 }]}
      refreshing={query.isRefetching && !query.isFetchingNextPage}
      onRefresh={() => void query.refetch()}
      onEndReachedThreshold={0.4}
      onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && void query.fetchNextPage?.()}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    />
  );
}

const s = StyleSheet.create({ content: { paddingHorizontal: 16, flexGrow: 1 }, gap: { gap: 12 }, sep: { height: 10 } });
