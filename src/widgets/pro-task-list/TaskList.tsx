import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { STAGES, isBlocked, sortTasks, stageOf, useTasks, type ProTask, type TaskStage } from "@/entities/pro-tasks";
import { useT } from "@/shared/i18n";
import { selectHaptic } from "@/shared/lib/haptics";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useKept } from "@/shared/lib/useKept";
import type { IconName } from "@/shared/ui";
import { ActionList, SearchBox } from "@/shared/ui/admin";
import { StageColumn } from "./StageColumn";
import { StageTabs } from "./StageTabs";
import { UndoBar } from "./UndoBar";
import { useTaskMoves } from "./useTaskMoves";

const ICON: Record<TaskStage, IconName> = { todo: "circle", doing: "play-circle", review: "eye", done: "check-circle" };

// Mobile kanban: stage tabs on top, one swipeable page per stage. Status changes need no drag & drop:
// card button, card swipe, or the "Move to…" menu — all through useTaskMoves (optimistic + undo).
export function TaskList({ onOpen }: { onOpen: (t: ProTask) => void }) {
  const { t } = useT();
  const query = useTasks();
  const { move, toggleBlocked, undo, revert } = useTaskMoves();
  const [stage, setStage] = useState<TaskStage>("todo");
  const [width, setWidth] = useState(0);
  const [picked, setPicked] = useState<ProTask | null>(null);
  const kept = useKept(picked);
  const [q, setQ] = useState("");
  const pager = useRef<ScrollView>(null);
  const target = useRef<TaskStage | null>(null); // the stage a tab tap is scrolling to: other scroll-end reports are ignored until it lands
  const release = useRef<ReturnType<typeof setTimeout> | null>(null);
  const needle = useDebounced(q, 250).trim().toLowerCase();
  const all = useMemo(() => query.data ?? [], [query.data]);

  const columns = useMemo(() => {
    const list = needle ? all.filter((x) => `${x.title} ${x.description} ${x.caseTitle}`.toLowerCase().includes(needle)) : all;
    const by = { todo: [], doing: [], review: [], done: [] } as Record<TaskStage, ProTask[]>;
    for (const x of sortTasks(list)) by[stageOf(x.status)].push(x);
    return by;
  }, [all, needle]);
  const counts = { todo: columns.todo.length, doing: columns.doing.length, review: columns.review.length, done: columns.done.length };

  // Keep the pager on the current stage when its width is known or changes (the first layout, rotation): no animation, no events.
  useEffect(() => {
    if (width > 0) pager.current?.scrollTo({ x: STAGES.indexOf(stage) * width, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);
  useEffect(() => () => { if (release.current) clearTimeout(release.current); }, []);

  const go = (next: TaskStage) => {
    if (next === stage) return;
    selectHaptic();
    target.current = next;
    if (release.current) clearTimeout(release.current);
    release.current = setTimeout(() => { target.current = null; }, 800); // safety: never stay locked if the scroll-end report is lost
    setStage(next);
    pager.current?.scrollTo({ x: STAGES.indexOf(next) * width, animated: true });
  };
  // Swiping the pager updates the tab. Reports that are not the pager's own (a column's vertical list can bubble its
  // scroll-end up: offset 0 would read as "first page") and the ones from a tab tap still on its way are ignored.
  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize } = e.nativeEvent;
    if (contentSize.width < width * STAGES.length - 1) return;
    const next = STAGES[Math.max(0, Math.min(STAGES.length - 1, Math.round(contentOffset.x / width)))];
    if (target.current) {
      if (next !== target.current) return;
      target.current = null;
    }
    if (next !== stage) {
      selectHaptic();
      setStage(next);
    }
  };

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
        <SearchBox value={q} onChangeText={setQ} placeholder={t("aw7.search")} />
        <StageTabs value={stage} counts={counts} onChange={go} />
      </View>
      <View style={{ flex: 1 }} onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}>
        {width > 0 ? (
          <ScrollView
            ref={pager}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={settle}
            keyboardShouldPersistTaps="handled"
          >
            {STAGES.map((st) => (
              <StageColumn
                key={st}
                width={width}
                stage={st}
                tasks={columns[st]}
                query={query}
                filtered={all.length > 0}
                onOpen={onOpen}
                onMove={move}
                onPick={setPicked}
              />
            ))}
          </ScrollView>
        ) : null}
      </View>
      <UndoBar undo={undo} onUndo={revert} />
      <ActionList visible={!!picked} onClose={() => setPicked(null)} title={kept ? `${t("aw7.moveTitle")}: ${kept.title}` : undefined} actions={menu} />
    </View>
  );
}
