import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { radius, useColors } from "@/shared/theme";
import { Avatar, Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { KIND_ICON, KIND_TINT } from "../model/kind";
import type { Work } from "../model/types";
import { useWorkText } from "../lib/useWorkText";
import { whenText } from "../lib/when";
import { WorkStatusPill } from "./WorkStatusPill";

// One work as a card that reads in four glances: the kind (tinted tile + small caps) and the title; the live status with the
// chat / meeting marks; the next step on a quiet strip; and who has it, its id and when it moved.
export function WorkRow({ work, onPress, enter = true }: { work: Work; onPress?: () => void; enter?: boolean }) {
  const c = useColors();
  const { t, locale } = useT();
  const text = useWorkText();
  const tint = KIND_TINT[work.kind];
  return (
    <Animated.View entering={enter ? FadeInDown.duration(240) : undefined}>
      <PressableScale onPress={onPress} accessibilityRole="button" style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
        <View style={s.top}>
          <View style={[s.icon, { backgroundColor: `${tint}22` }]}><Icon name={KIND_ICON[work.kind]} size={22} color={tint} /></View>
          <View style={s.col}>
            <Text variant="caption" weight="bold" numberOfLines={1} style={[s.kind, { color: tint }]}>{text.kind(work.kind)}</Text>
            <Text variant="body" weight="bold" numberOfLines={2}>{work.title || text.kind(work.kind)}</Text>
          </View>
          <Icon name="chevron-right" size={18} color={c.gray2} />
        </View>
        <View style={s.mid}>
          <WorkStatusPill status={work.status} label={work.statusLabel} />
          <View style={s.marks}>
            {work.hasChat ? <View style={[s.mark, { backgroundColor: c.surface2 }]}><Icon name="message-circle" size={14} color={c.accent} /></View> : null}
            {work.hasMeeting ? <View style={[s.mark, { backgroundColor: c.surface2 }]}><Icon name="video" size={14} color={c.accent} /></View> : null}
          </View>
        </View>
        {work.nextAction ? <View style={[s.next, { backgroundColor: c.surface2 }]}><Icon name="arrow-right" size={14} color={c.accent} /><Text variant="small" tone="accent" weight="semibold" numberOfLines={2} style={s.col}>{text.next(work.nextAction)}</Text></View> : null}
        <View style={s.foot}>
          {work.assignee ? <><Avatar name={work.assignee.name} size={22} /><Text variant="caption" tone="gray" numberOfLines={1} style={s.who}>{work.assignee.name}</Text></> : <View style={s.who} />}
          <Text variant="caption" tone="gray2" numberOfLines={1}>{[work.workId, whenText(work.updatedAt || work.createdAt, t, locale)].filter(Boolean).join(" · ")}</Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, gap: 12, borderRadius: radius.rl, borderWidth: 1 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 46, height: 46, borderRadius: radius.r, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
  kind: { textTransform: "uppercase", letterSpacing: 1, fontSize: 10 },
  mid: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  marks: { flexDirection: "row", gap: 6 },
  mark: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  next: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 10, borderRadius: 12 },
  foot: { flexDirection: "row", alignItems: "center", gap: 8 },
  who: { flex: 1 },
});
