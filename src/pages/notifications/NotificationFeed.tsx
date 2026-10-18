import { useState } from "react";
import { FlatList } from "react-native";
import { linkInputOf, useMarkRead, type Notification } from "@/entities/notification";
import { useOpenLink } from "@/features/open-link";
import { NotificationSheet } from "@/widgets/notification-sheet";
import { useTabHeader } from "@/widgets/tab-page";
import { PushPermissionCard } from "@/widgets/push-permission";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { useIsOnline } from "@/shared/network";
import { Button, EmptyState, ErrorView, ListRowSkeleton } from "@/shared/ui";
import { NotificationCell } from "./NotificationCell";
import { NotificationFilters } from "./NotificationFilters";
import type { useFeed } from "./useFeed";

// The list: filters on top, one card per event under day headings, detail sheet, pull-to-refresh, paging.
export function NotificationFeed({ feed, bottomPad }: { feed: ReturnType<typeof useFeed>; bottomPad?: number }) {
  const top = useTabHeader();
  const { t } = useT();
  const insets = useInsets();
  const { open, resolve } = useOpenLink();
  const markOne = useMarkRead();
  const online = useIsOnline();
  const [sheet, setSheet] = useState<Notification | null>(null);
  const { list, items } = feed;
  const read = (n: Notification) => !n.read && markOne.mutate(n);
  const header = (
    <>
      {top}<PushPermissionCard />
      <NotificationFilters cat={feed.cat} onCat={feed.setCat} onlyUnread={feed.onlyUnread} onUnread={feed.setOnlyUnread} onlyRead={feed.onlyRead} onRead={feed.setOnlyRead} counts={feed.counts} total={feed.unreadTotal} text={feed.search.text} onText={feed.search.setText} />
    </>
  );
  const empty = list.isLoading ? (
    <ListRowSkeleton rows={7} padded />
  ) : !online && !list.data ? (
    <EmptyState icon="wifi-off" title={t("nt1.offline")} text={t("nt1.offlineText")} />
  ) : list.isError && !list.data ? (
    <ErrorView error={list.error} onRetry={() => void list.refetch()} />
  ) : feed.filtering ? (
    <EmptyState icon="search" title={t("nt1.noMatch")} text={t("nt1.noMatchText")} />
  ) : (
    <EmptyState icon="bell" title={t("profile.notificationsEmpty")} text={t("profile.notificationsEmptyText")} />
  );
  return (
    <>
      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        ListHeaderComponent={header}
        renderItem={({ item, index }) => (
          <NotificationCell
            item={item}
            prev={items[index - 1]}
            onPress={() => { setSheet(item); read(item); }}
            onOpen={resolve({ input: linkInputOf(item) }).kind === "target" ? () => { read(item); void open({ input: linkInputOf(item) }, "notification_list"); } : undefined}
          />
        )}
        ListEmptyComponent={empty}
        ListFooterComponent={feed.more ? <Button title={t("nt1.loadMore")} variant="soft" full loading={list.isFetchingNextPage} onPress={() => void list.fetchNextPage()} style={{ margin: 16 }} /> : null}
        contentContainerStyle={{ paddingBottom: bottomPad ?? insets.bottom + 24, flexGrow: 1 }}
        refreshing={list.isRefetching && !list.isFetchingNextPage}
        onRefresh={() => void list.refetch()}
        onEndReachedThreshold={0.5}
        onEndReached={() => feed.more && !list.isFetchingNextPage && void list.fetchNextPage()}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
      />
      <NotificationSheet item={sheet} onClose={() => setSheet(null)} />
    </>
  );
}
