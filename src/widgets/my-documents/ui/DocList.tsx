import type { ReactElement } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { EmptyState, ErrorView, Skeleton } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { RA_OPENER, raOk, useRaControl } from "@/shared/remote-assist";
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

// A card on the remote-assistance map while it is on screen: the operator may point at it or open its detail sheet (named by its public id).
function Item({ row, first, last, onOpen, onSend }: { row: DocRow; first: boolean; last: boolean; onOpen: (id: string) => void; onSend: (id: string) => void }) {
  const { t } = useT();
  const ra = useRaControl({
    id: `my_documents.item.${row.id}`,
    label: t("ra.el.doc", { id: row.workId || row.id.slice(0, 8) }),
    actions: RA_OPENER,
    open: () => {
      onOpen(row.id);
      return raOk();
    },
  });
  return <View {...ra}><DocListItem row={row} first={first} last={last} onOpen={onOpen} onSend={onSend} /></View>;
}

// The list body: skeleton cards → error → empty / filtered-empty → sections, each one card of rows, pull to refresh, and ten more on
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
      renderItem={({ item, index }) => (item.head ? <DocSectionHead kind={item.head} n={item.n ?? 0} /> : item.row ? <Item row={item.row} first={index === 0 || !!data[index - 1]?.head} last={index === data.length - 1 || !!data[index + 1]?.head} onOpen={onOpen} onSend={onSend} /> : <View />)}
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

const s = StyleSheet.create({ content: { paddingHorizontal: 16, flexGrow: 1 }, gap: { gap: 12 } });
