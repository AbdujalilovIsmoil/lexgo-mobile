import { useState } from "react";
import { useTabHeader } from "@/widgets/tab-page";
import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { WorkRow, WorkRowSkeleton, type Work, type useWorks } from "@/entities/work";
import { useWorkFilters, type GroupFilter } from "@/features/work-filters";
import { Button, ErrorView, Text } from "@/shared/ui";
import { PAGE, growWindow, nextCount } from "@/shared/lib/pageWindow";
import { RA_OPENER, raOk, useRaControl } from "@/shared/remote-assist";
import { useT } from "@/shared/i18n";
import { WorksEmpty } from "./WorksEmpty";
import { WorksFilterBar } from "./WorksFilterBar";
import { WorksFooter } from "./WorksFooter";
import { WorksSummary } from "./WorksSummary";
import { usePullRefresh } from "@/shared/lib/usePullRefresh";

const ALL_GROUPS: GroupFilter[] = ["all", "running", "queue", "active", "review", "done", "closed"];

// A row on the remote-assistance map while it is on screen: the operator may point at a work or open its sheet (named by its public id).
function Row({ work, onOpen, first, last }: { work: Work; onOpen: (w: Work) => void; first: boolean; last: boolean }) {
  const { t } = useT();
  const ra = useRaControl({
    id: `works.item.${work.id || work.workId}`,
    label: t("ra.el.work", { id: work.workId || work.id }),
    actions: RA_OPENER,
    open: () => {
      onOpen(work);
      return raOk();
    },
  });
  return <View {...ra}><WorkRow work={work} onPress={() => onOpen(work)} first={first} last={last} /></View>;
}

type Props = {
  works: ReturnType<typeof useWorks>;
  onOpen: (w: Work) => void;
  bottom: number;
  groups?: GroupFilter[];
  initialGroup?: GroupFilter;
  lead?: boolean;
};

// The client's works: counters and filters on top, the works as rows of one card below — ten at a time ("Yana 10 ta" adds ten more; any
// filter or search starts again at ten) — with skeleton / error / empty states, pull to refresh and a footer while the remaining pages
// load in the background (the counters and filters need every work's status).
export function WorksList({ works, onOpen, bottom, groups = ALL_GROUPS, initialGroup = "all", lead }: Props) {
  const { t } = useT();
  const top = useTabHeader(16);
  const f = useWorkFilters(works.items, initialGroup);
  const failed = works.isError && works.items.length > 0;
  const pull = usePullRefresh(() => works.refetch());
  // The window of shown rows belongs to one filter set; another one starts again at the first ten.
  const key = `${f.filters.kind}|${f.filters.group}|${f.filters.q.trim()}`;
  const [win, setWin] = useState({ key, n: PAGE });
  const n = Math.min(win.key === key ? win.n : PAGE, f.shown.length);
  const rows = f.shown.slice(0, n);
  const left = f.shown.length - n;
  const body = works.isLoading ? <WorkRowSkeleton /> : works.isError && !works.items.length ? <ErrorView error={works.error} onRetry={() => void works.refetch()} /> : <WorksEmpty filtered={f.active} onReset={f.reset} />;
  return (
    <FlashList // up to 1000 works: rows are recycled instead of built one per work
      data={works.isLoading ? [] : rows}
      keyExtractor={(w) => w.id || w.workId}
      renderItem={({ item, index }) => <Row work={item} onOpen={onOpen} first={index === 0} last={index === rows.length - 1} />}
      ListHeaderComponent={<>{top}{lead ? <WorksSummary works={works.items} group={f.filters.group} onGroup={(group) => f.set({ group })} /> : null}<WorksFilterBar filters={f.filters} onChange={f.set} kindCounts={f.kindCounts} groupCounts={f.groupCounts} groups={groups} total={f.shown.length} onReset={f.reset} docsLink={lead} /></>}
      ListEmptyComponent={body}
      ListFooterComponent={
        <View style={{ gap: 6 }}>
          {left > 0 ? <Button title={t("cl1.list.more", { n: nextCount(n, f.shown.length) })} icon="chevron-down" variant="soft" full style={{ marginTop: 12 }} onPress={() => setWin({ key, n: growWindow(n, f.shown.length) })} /> : null}
          {rows.length ? <Text variant="caption" tone="gray2" center>{t("cl1.list.shownOf", { shown: n, total: f.active ? f.shown.length : Math.max(works.total, f.shown.length) })}</Text> : null}
          <WorksFooter filling={works.filling && left === 0} failed={failed} onRetry={() => void works.refetch()} />
        </View>
      }
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottom, flexGrow: 1 }}
      refreshing={pull.refreshing}
      onRefresh={pull.onRefresh}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      maintainVisibleContentPosition={{ disabled: true }} // a new filter starts the list from the top
    />
  );
}
