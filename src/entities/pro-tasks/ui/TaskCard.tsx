import { useRef } from "react";
import { StyleSheet, View } from "react-native";
import Swipeable, { SwipeDirection, type SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { tOr } from "@/shared/lib/pro/tOr";
import { brand, radius, useColors } from "@/shared/theme";
import { Card, Icon, Pill, PressableScale, Text, type IconName, type PillTone } from "@/shared/ui";
import { isBlocked, isDone, isOverdue, stageOf, stepStage } from "../lib/stage";
import type { ProTask, TaskStage } from "../model/types";

const PRIO = { high: "err", medium: "warn", low: "gray" } as const;
const STAGE_TONE: Record<TaskStage, PillTone> = { todo: "gray", doing: "blue", review: "warn", done: "ok" };
const HIT = { top: 9, bottom: 9, left: 8, right: 8 };

type Props = {
  task: ProTask;
  onOpen: () => void;
  /** Move to `stage` (the card's own buttons and swipes all end up here). */
  onMove: (stage: TaskStage) => void;
  /** Open the "Move to…" menu. */
  onPickStage: () => void;
};

// Board card. Tap the body to edit; the footer has the stage pill (menu) and the one-tap "next stage" button;
// swiping sideways does the same as the button for next / previous (never the only way).
export function TaskCard({ task, onOpen, onMove, onPickStage }: Props) {
  const c = useColors();
  const { t, locale } = useT();
  const ref = useRef<SwipeableMethods>(null);
  const stage = stageOf(task.status);
  const next = stepStage(stage, 1);
  const prev = stepStage(stage, -1);
  const over = isOverdue(task);
  const total = task.checklist.length;
  const left = task.checklist.filter((x) => x.done).length;
  const meta = [task.caseTitle, total ? t("aw7.checkCount", { done: left, total }) : ""].filter(Boolean).join(" · ");
  const stageName = t(`aw7.tab.${stage}`);
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
          <Text variant="body" weight="bold" numberOfLines={3} tone={isDone(task) ? "gray" : "ink"} style={isDone(task) ? s.strike : undefined}>{task.title}</Text>
          {meta ? <Text variant="caption" tone="gray" numberOfLines={1}>{meta}</Text> : null}
          <View style={s.pills}>
            {task.dueDate ? <Pill small tone={over ? "err" : "gray"} icon={over ? "alert-circle" : "calendar"} label={fmtDate(task.dueDate, locale)} /> : null}
            <Pill small tone={PRIO[task.priority as keyof typeof PRIO] ?? "gray"} label={tOr(t, `aw11.priority.${task.priority}`, task.priority)} />
            {isBlocked(task) ? <Pill small tone="err" icon="slash" label={t("aw7.blocked")} /> : null}
          </View>
          {total ? (
            <View accessible accessibilityRole="progressbar" accessibilityLabel={t("aw7.checkCount", { done: left, total })} accessibilityValue={{ min: 0, max: total, now: left }} style={[s.track, { backgroundColor: c.surface2 }]}>
              <View style={[s.fill, { width: `${(left / total) * 100}%`, backgroundColor: left === total ? c.ok : c.accent }]} />
            </View>
          ) : null}
        </PressableScale>
        <View style={[s.footer, { borderTopColor: c.line }]}>
          <PressableScale onPress={onPickStage} hitSlop={HIT} accessibilityLabel={t("aw7.changeStage", { stage: stageName })} style={s.stage}>
            <Pill small tone={STAGE_TONE[stage]} label={stageName} />
            <Icon name="chevron-down" size={16} tone="gray" />
          </PressableScale>
          <PressableScale
            onPress={() => onMove(forwardTo)}
            accessibilityLabel={forward}
            style={[s.next, { backgroundColor: next ? brand.b600 : c.surface2 }]}
          >
            <Text variant="small" weight="bold" style={{ color: next ? "#FFFFFF" : c.ink }}>{forward}</Text>
            <Icon name={next ? "arrow-right" : "rotate-ccw"} size={15} color={next ? "#FFFFFF" : c.ink} />
          </PressableScale>
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
  body: { padding: 14, gap: 6 },
  strike: { textDecorationLine: "line-through" },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  track: { height: 5, borderRadius: radius.pill, overflow: "hidden", marginTop: 4 },
  fill: { height: "100%", borderRadius: radius.pill },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth },
  stage: { flexDirection: "row", alignItems: "center", gap: 2 },
  next: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingHorizontal: 16, borderRadius: radius.pill },
});
