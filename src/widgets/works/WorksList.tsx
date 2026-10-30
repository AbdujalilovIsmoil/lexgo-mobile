import { useTabHeader } from "@/widgets/tab-page";
import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { WorkRow, WorkRowSkeleton, type Work, type useWorks } from "@/entities/work";
import { useWorkFilters, type GroupFilter } from "@/features/work-filters";
import { ErrorView } from "@/shared/ui";
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

// The client's works: counters and filters on top, the works as rows of one card below, with skeleton / error / empty states,
// pull to refresh and a footer while the remaining pages load in the background.
export function WorksList({ works, onOpen, bottom, groups = ALL_GROUPS, initialGroup = "all", lead }: Props) {
  const top = useTabHeader(16);
  const f = useWorkFilters(works.items, initialGroup);
  const failed = works.isError && works.items.length > 0;
  const pull = usePullRefresh(() => works.refetch());
  const body = works.isLoading ? <WorkRowSkeleton /> : works.isError && !works.items.length ? <ErrorView error={works.error} onRetry={() => void works.refetch()} /> : <WorksEmpty filtered={f.active} onReset={f.reset} />;
  return (
    <FlashList // up to 1000 works: rows are recycled instead of built one per work
      data={works.isLoading ? [] : f.shown}
      keyExtractor={(w) => w.id || w.workId}
      renderItem={({ item, index }) => <Row work={item} onOpen={onOpen} first={index === 0} last={index === f.shown.length - 1} />}
      ListHeaderComponent={<>{top}{lead ? <WorksSummary works={works.items} group={f.filters.group} onGroup={(group) => f.set({ group })} /> : null}<WorksFilterBar filters={f.filters} onChange={f.set} kindCounts={f.kindCounts} groupCounts={f.groupCounts} groups={groups} total={f.shown.length} onReset={f.reset} docsLink={lead} /></>}
      ListEmptyComponent={body}
      ListFooterComponent={<WorksFooter filling={works.filling} failed={failed} onRetry={() => void works.refetch()} />}
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
