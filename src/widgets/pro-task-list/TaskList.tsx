import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { STAGES, isBlocked, sortTasks, stageOf, useTasks, type ProTask, type TaskStage } from "@/entities/pro-tasks";
import { useT } from "@/shared/i18n";
import { StaleNote } from "@/shared/network";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useInsets } from "@/shared/lib/insets";
import { useKept } from "@/shared/lib/useKept";
import { Carousel, EmptyState, ErrorView, Segmented, Skeleton, type IconName } from "@/shared/ui";
import { ActionList, ChipBar, SearchBox } from "@/shared/ui/admin";
import { StageColumn } from "./StageColumn";
import { TaskColumn } from "./TaskColumn";
import { UndoBar } from "./UndoBar";
import { useTaskMoves } from "./useTaskMoves";

const ICON: Record<TaskStage, IconName> = { todo: "circle", doing: "play-circle", review: "eye", done: "check-circle" };
type Mode = "board" | "list";

// A Kanban (every stage a column you swipe through, one column ≈ one screen, centred so both neighbours peek out equally) or a plain
// list with stage chips. Status changes need no drag & drop: the stage chip, the arrows, a card swipe or the "Move to…" menu — all
// through useTaskMoves (optimistic + undo).
export function TaskList({ onOpen }: { onOpen: (t: ProTask) => void }) {
  const { t } = useT();
  const insets = useInsets();
  const query = useTasks();
  const { move, toggleBlocked, undo, revert } = useTaskMoves();
  const [mode, setMode] = useState<Mode>("board");
  const [filter, setFilter] = useState<TaskStage | "">("");
  const [picked, setPicked] = useState<ProTask | null>(null);
  const kept = useKept(picked);
  const [q, setQ] = useState("");
  const needle = useDebounced(q, 250).trim().toLowerCase();
  const all = useMemo(() => query.data ?? [], [query.data]);

  const by = (list: ProTask[]) => {
    const out = { todo: [], doing: [], review: [], done: [] } as Record<TaskStage, ProTask[]>;
    for (const x of sortTasks(list)) out[stageOf(x.status)].push(x);
    return out;
  };
  const totals = useMemo(() => by(all), [all]);
  const columns = useMemo(() => (needle ? by(all.filter((x) => `${x.title} ${x.description} ${x.caseTitle}`.toLowerCase().includes(needle))) : totals), [all, needle, totals]);
  const listed = useMemo(() => (filter ? columns[filter] : sortTasks(Object.values(columns).flat())), [columns, filter]);
  const counts = { todo: columns.todo.length, doing: columns.doing.length, review: columns.review.length, done: columns.done.length };

  const menu = kept
    ? [
        ...STAGES.map((st) => ({
          key: st,
          label: t(`aw7.tab.${st}`),
          icon: (stageOf(kept.status) === st && !isBlocked(kept) ? "check" : ICON[st]) as IconName,
          onPress: () => move(kept, st),
        })),
        { key: "blocked", label: isBlocked(kept) ? t("aw7.unblock") : t("aw7.block"), icon: "slash" as IconName, danger: !isBlocked(kept), onPress: () => toggleBlocked(kept) },
      ]
    : [];

  const state = query.isLoading ? (
    <View style={{ gap: 12, paddingHorizontal: 16 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={132} round={20} />)}</View>
  ) : query.isError ? (
    <ErrorView error={query.error} onRetry={() => void query.refetch()} />
  ) : !all.length ? (
    <EmptyState icon="check-square" title={t("aw7.empty")} text={t("aw7.emptyText")} compact />
  ) : null;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ gap: 10 }}>
        <StaleNote updatedAt={query.dataUpdatedAt} hasData={query.data !== undefined} />
        <SearchBox value={q} onChangeText={setQ} placeholder={t("aw7.search")} />
        <View style={{ paddingHorizontal: 16 }}>
          <Segmented options={[{ value: "board", label: t("aw7.mode.board"), icon: "layers" }, { value: "list", label: t("aw7.mode.list"), icon: "list" }]} value={mode} onChange={setMode} />
        </View>
        {mode === "list" ? (
          <ChipBar
            options={[{ value: "" as const, label: t("adm.all"), count: needle ? listedCount(columns) : all.length }, ...STAGES.map((st) => ({ value: st, label: t(`aw7.tab.${st}`), count: counts[st] }))]}
            value={filter}
            onChange={setFilter}
          />
        ) : null}
      </View>
      {mode === "list" ? (
        <StageColumn stage={filter || "all"} tasks={listed} query={query} filtered={all.length > 0} onOpen={onOpen} onMove={move} onPick={setPicked} />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 96, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {state ?? (
            <Carousel
              items={STAGES}
              keyOf={(st) => st}
              cardWidth={(rail) => Math.min(rail * 0.86, 440)}
              align="flex-start"
              renderItem={(st) => <TaskColumn stage={st} tasks={columns[st]} total={totals[st].length} filtered={!!needle} onOpen={onOpen} onMove={move} onPick={setPicked} />}
            />
          )}
        </ScrollView>
      )}
      <UndoBar undo={undo} onUndo={revert} />
      <ActionList visible={!!picked} onClose={() => setPicked(null)} title={kept ? `${t("aw7.moveTitle")}: ${kept.title}` : undefined} actions={menu} />
    </View>
  );
}

const listedCount = (c: Record<TaskStage, ProTask[]>) => STAGES.reduce((n, st) => n + c[st].length, 0);
