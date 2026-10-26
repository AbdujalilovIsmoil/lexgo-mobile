import { FlatList, View } from "react-native";
import { TaskCard, type ProTask, type TaskStage } from "@/entities/pro-tasks";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { EmptyState, ErrorView, Skeleton } from "@/shared/ui";

type Q = { isLoading: boolean; isError: boolean; error: unknown; refetch: () => unknown; isRefetching: boolean };
type Props = {
  /** The stage this page shows; "all" is the list view across stages. */
  stage: TaskStage | "all";
  tasks: ProTask[];
  query: Q;
  /** True when the board has tasks but this column (or the search) shows none. */
  filtered: boolean;
  onOpen: (t: ProTask) => void;
  onMove: (t: ProTask, s: TaskStage) => void;
  onPick: (t: ProTask) => void;
};

// One board page (or the whole list): the stage's tasks, a skeleton / error while loading, and an empty state of its own.
export function StageColumn({ stage, tasks, query, filtered, onOpen, onMove, onPick }: Props) {
  const { t } = useT();
  const insets = useInsets();
  const state = query.isLoading ? (
    <View style={{ gap: 12 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={132} round={20} />)}</View>
  ) : query.isError ? (
    <ErrorView error={query.error} onRetry={() => void query.refetch()} />
  ) : (
    <EmptyState icon="check-square" title={filtered ? t("aw7.emptyFilter") : t("aw7.empty")} text={filtered ? undefined : t("aw7.emptyText")} compact />
  );
  return (
    <FlatList
      style={{ flex: 1 }}
      data={query.isLoading || query.isError ? [] : tasks}
      keyExtractor={(x) => x.id}
      renderItem={({ item }) => <TaskCard task={item} onOpen={() => onOpen(item)} onMove={(s) => onMove(item, s)} onPickStage={() => onPick(item)} />}
      ListEmptyComponent={state}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 96, flexGrow: 1 }}
      refreshing={query.isRefetching}
      onRefresh={() => void query.refetch()}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      accessibilityLabel={stage === "all" ? t("adm.all") : t(`aw7.tab.${stage}`)}
    />
  );
}
