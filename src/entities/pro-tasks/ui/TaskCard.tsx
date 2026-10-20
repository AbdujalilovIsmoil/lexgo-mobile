import { useRef } from "react";
import { StyleSheet, View } from "react-native";
import Swipeable, { SwipeDirection, type SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import { useIsPending } from "@/shared/cache";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { tOr } from "@/shared/lib/pro/tOr";
import { brand, radius, useColors } from "@/shared/theme";
import { Card, Icon, Pill, PressableScale, ShiftButton, StageChip, Text, type IconName } from "@/shared/ui";
import { KIND_CREATE, KIND_STATUS, KIND_UPDATE } from "../model/offline";
import { STAGE_TINT, isBlocked, isDone, isOverdue, stageOf, stepStage } from "../lib/stage";
import type { ProTask, TaskStage } from "../model/types";

const PRIO = { high: "err", medium: "warn", low: "gray" } as const;

type Props = {
  task: ProTask;
  onOpen: () => void;
  /** Move to `stage` (the card's own buttons and swipes all end up here). */
  onMove: (stage: TaskStage) => void;
  /** Open the "Move to…" menu. */
  onPickStage: () => void;
};

// Board card, laid out like the sales operator's lead card: title and priority, the stage chip (menu) among the tags,
// then a foot with the due date and the round arrows to the previous / next stage. Swiping sideways does the same as
// the arrows (never the only way).
export function TaskCard({ task, onOpen, onMove, onPickStage }: Props) {
  const c = useColors();
  const { t, locale } = useT();
  const ref = useRef<SwipeableMethods>(null);
  const waiting = [useIsPending(KIND_CREATE, task.id), useIsPending(KIND_UPDATE, task.id), useIsPending(KIND_STATUS, task.id)].some(Boolean);
  const stage = stageOf(task.status);
  const next = stepStage(stage, 1);
  const prev = stepStage(stage, -1);
  const over = isOverdue(task);
  const total = task.checklist.length;
  const left = task.checklist.filter((x) => x.done).length;
  const meta = [task.caseTitle, total ? t("aw7.checkCount", { done: left, total }) : ""].filter(Boolean).join(" · ");
  const stageName = t(`aw7.tab.${stage}`);
  const stageColor = c[STAGE_TINT[stage]];
  const forward = next ? t(`aw7.next.${next}`) : t("aw7.reopen");

  // Swiping left reveals the right-hand panel and advances; swiping right goes back.
  const forwardTo = next ?? "todo";
  // The direction names the way the row slid: RIGHT = left panel opened = previous stage.
  const onOpenSide = (dir: SwipeDirection) => {
    ref.current?.close();
    if (dir === SwipeDirection.LEFT) onMove(forwardTo);
    else if (prev) onMove(prev);
  };

  return (
    <Swipeable
      ref={ref}
      friction={2}
      overshootLeft={false}
      overshootRight={false}
      leftThreshold={72}
      rightThreshold={72}
      dragOffsetFromLeftEdge={24}
      dragOffsetFromRightEdge={24}
      renderRightActions={() => <Panel side="right" label={forward} icon={next ? "arrow-right" : "rotate-ccw"} bg={next ? brand.b600 : c.ok} />}
      renderLeftActions={prev ? () => <Panel side="left" label={t(`aw7.next.${prev}`)} icon="arrow-left" bg={c.gray} /> : undefined}
      onSwipeableOpen={onOpenSide}
      containerStyle={s.swipe}
    >
      <Card padded={false}>
        <PressableScale onPress={onOpen} scale={0.99} accessibilityLabel={t("aw7.openTask", { title: task.title })} style={s.body}>
          <View style={s.row}>
            <Text variant="body" weight="bold" numberOfLines={3} tone={isDone(task) ? "gray" : "ink"} style={[s.fill, isDone(task) && s.strike]}>{task.title}</Text>
            <Pill small tone={PRIO[task.priority as keyof typeof PRIO] ?? "gray"} label={tOr(t, `aw11.priority.${task.priority}`, task.priority)} />
          </View>
          <View style={s.tags}>
            <StageChip title={stageName} color={stageColor} onPress={onPickStage} />
            {isBlocked(task) ? <Pill small tone="err" icon="slash" label={t("aw7.blocked")} /> : null}
            {waiting ? <Pill small tone="warn" icon="clock" label={t("nt3.net.pending")} /> : null}
          </View>
          {meta ? <Text variant="caption" tone="gray2" numberOfLines={2}>{meta}</Text> : null}
          {total ? (
            <View accessible accessibilityRole="progressbar" accessibilityLabel={t("aw7.checkCount", { done: left, total })} accessibilityValue={{ min: 0, max: total, now: left }} style={[s.track, { backgroundColor: c.surface2 }]}>
              <View style={[s.bar, { width: `${(left / total) * 100}%`, backgroundColor: left === total ? c.ok : c.accent }]} />
            </View>
          ) : null}
        </PressableScale>
        <View style={[s.row, s.foot, { borderTopColor: c.line }]}>
          {task.dueDate ? (
            <View style={s.due}>
              <Icon name={over ? "alert-circle" : "calendar"} size={13} color={over ? c.err : c.gray2} />
              <Text variant="caption" weight="semibold" numberOfLines={1} style={{ color: over ? c.err : c.gray2 }}>{fmtDate(task.dueDate, locale)}</Text>
            </View>
          ) : null}
          <View style={s.fill} />
          <ShiftButton icon="chevron-left" label={prev ? t(`aw7.next.${prev}`) : undefined} disabled={!prev} onPress={() => prev && onMove(prev)} />
          <ShiftButton icon={next ? "chevron-right" : "rotate-ccw"} label={forward} disabled={false} onPress={() => onMove(forwardTo)} />
        </View>
      </Card>
    </Swipeable>
  );
}

// Coloured panel revealed under a swiped card (decorative: the card's buttons are the accessible path).
function Panel({ side, label, icon, bg }: { side: "left" | "right"; label: string; icon: IconName; bg: string }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.action, { backgroundColor: bg, alignItems: side === "right" ? "flex-end" : "flex-start" }]}>
      <View style={s.actionIn}>
        <Icon name={icon} size={20} tone="white" />
        <Text variant="caption" weight="bold" tone="white" numberOfLines={1}>{label}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  swipe: { borderRadius: 20, overflow: "hidden" },
  action: { justifyContent: "center", width: 150, paddingHorizontal: 18 },
  actionIn: { alignItems: "center", gap: 3, maxWidth: 114 },
  body: { padding: 14, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  fill: { flex: 1 },
  strike: { textDecorationLine: "line-through" },
  tags: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  track: { height: 5, borderRadius: radius.pill, overflow: "hidden" },
  bar: { height: "100%", borderRadius: radius.pill },
  foot: { paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth },
  due: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
});
