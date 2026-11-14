import { useMemo, useState } from "react";
import { View } from "react-native";
import { STAGES, isBlocked, sortTasks, stageOf, useTasks, type ProTask, type TaskStage } from "@/entities/pro-tasks";
import { useT } from "@/shared/i18n";
import { StaleNote } from "@/shared/network";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useKept } from "@/shared/lib/useKept";
import { type IconName } from "@/shared/ui";
import { ActionList, ChipBar, SearchBox } from "@/shared/ui/admin";
import { StageColumn } from "./StageColumn";
import { UndoBar } from "./UndoBar";
import { useTaskMoves } from "./useTaskMoves";

const ICON: Record<TaskStage, IconName> = { todo: "circle", doing: "play-circle", review: "eye", done: "check-circle" };

// Built for a phone: no side-scrolling Kanban (its columns were cut off by the screen edge) — the stages are tabs with their counts and
// the chosen stage's tasks (or all of them) fill the width as full cards. Status changes need no drag & drop: the stage chip, the arrows,
// a card swipe or the "Move to…" menu — all through useTaskMoves (optimistic + undo).
export function TaskList({ onOpen }: { onOpen: (t: ProTask) => void }) {
  const { t } = useT();
  const query = useTasks();
  const { move, toggleBlocked, undo, revert } = useTaskMoves();
  const [filter, setFilter] = useState<TaskStage | "">("");
  const [picked, setPicked] = useState<ProTask | null>(null);
  const kept = useKept(picked);
  const [q, setQ] = useState("");
  const needle = useDebounced(q, 250).trim().toLowerCase();
  const all = useMemo(() => query.data ?? [], [query.data]);

  const columns = useMemo(() => {
    const out = { todo: [], doing: [], review: [], done: [] } as Record<TaskStage, ProTask[]>;
    const list = needle ? all.filter((x) => `${x.title} ${x.description} ${x.caseTitle}`.toLowerCase().includes(needle)) : all;
    for (const x of sortTasks(list)) out[stageOf(x.status)].push(x);
    return out;
  }, [all, needle]);
  // "All" puts the work still open first and what is done at the end.
  const listed = useMemo(() => (filter ? columns[filter] : STAGES.flatMap((st) => columns[st])), [columns, filter]);
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

  return (
    <View style={{ flex: 1 }}>
      <View style={{ gap: 10 }}>
        <StaleNote updatedAt={query.dataUpdatedAt} hasData={query.data !== undefined} />
        <SearchBox value={q} onChangeText={setQ} placeholder={t("aw7.search")} />
        <ChipBar
          options={[{ value: "" as const, label: t("adm.all"), count: STAGES.reduce((n, st) => n + counts[st], 0) }, ...STAGES.map((st) => ({ value: st, label: t(`aw7.tab.${st}`), count: counts[st] }))]}
          value={filter}
          onChange={setFilter}
          white
        />
      </View>
      <StageColumn stage={filter || "all"} tasks={listed} query={query} filtered={all.length > 0} onOpen={onOpen} onMove={move} onPick={setPicked} />
      <UndoBar undo={undo} onUndo={revert} />
      <ActionList visible={!!picked} onClose={() => setPicked(null)} title={kept ? `${t("aw7.moveTitle")}: ${kept.title}` : undefined} actions={menu} />
    </View>
  );
}
