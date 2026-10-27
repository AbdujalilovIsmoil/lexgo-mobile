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

const ALL_GROUPS: GroupFilter[] = ["all", "queue", "active", "review", "done", "closed"];
const Gap = () => <View style={{ height: 10 }} />;

// A row on the remote-assistance map while it is on screen: the operator may point at a work or open its sheet (named by its public id).
function Row({ work, onOpen }: { work: Work; onOpen: (w: Work) => void }) {
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
  return <View {...ra}><WorkRow work={work} onPress={() => onOpen(work)} enter={false} /></View>;
}

type Props = {
  works: ReturnType<typeof useWorks>;
  onOpen: (w: Work) => void;
  bottom: number;
  groups?: GroupFilter[];
  initialGroup?: GroupFilter;
  lead?: boolean;
};

// The client's works: filters on top, rows below, with skeleton / error / empty states,
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
      renderItem={({ item }) => <Row work={item} onOpen={onOpen} />}
      ItemSeparatorComponent={Gap}
      ListHeaderComponent={<>{top}{lead ? <WorksSummary works={works.items} /> : null}<WorksFilterBar filters={f.filters} onChange={f.set} kindCounts={f.kindCounts} groupCounts={f.groupCounts} groups={groups} total={f.shown.length} onReset={f.reset} /></>}
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
