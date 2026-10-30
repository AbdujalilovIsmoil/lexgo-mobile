import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { KIND_ICON, KIND_TINT } from "../model/kind";
import type { Work } from "../model/types";
import { useWorkText } from "../lib/useWorkText";
import { whenText } from "../lib/when";
import { WorkStatusPill } from "./WorkStatusPill";

type Props = { work: Work; onPress?: () => void; first?: boolean; last?: boolean };

// One work as a row of the works card: its id in the kind's colour (with the kind's mark) and the status at the right, the title; under them
// the next step (the client's turn) — or who has it and the kind — and when it moved, with the chat / meeting marks. `first` / `last` round
// the card's corners and close its edges.
export function WorkRow({ work, onPress, first = true, last = true }: Props) {
  const c = useColors();
  const { t, locale } = useT();
  const text = useWorkText();
  const tint = KIND_TINT[work.kind];
  const when = whenText(work.updatedAt || work.createdAt, t, locale);
  const sub = work.nextAction
    ? t("cl1.list.next", { s: text.next(work.nextAction) })
    : [work.assignee?.name, text.kind(work.kind)].filter(Boolean).join(" · ");
  return (
    <PressableScale onPress={onPress} scale={0.99} accessibilityRole="button" accessibilityLabel={work.title || text.kind(work.kind)}
      style={[s.row, { backgroundColor: c.surface, borderColor: c.line }, first && s.first, last && s.last, !last && { borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={s.main}>
        <View style={s.idRow}>
          <Icon name={KIND_ICON[work.kind]} size={13} color={tint} />
          <Text variant="caption" weight="bold" numberOfLines={1} style={[s.id, { color: tint }]}>{work.workId || text.kind(work.kind)}</Text>
          <View style={s.pill}><WorkStatusPill status={work.status} label={work.statusLabel} /></View>
        </View>
        <Text variant="h4" numberOfLines={2} style={s.title}>{work.title || text.kind(work.kind)}</Text>
        {sub ? <Text variant="small" tone={work.nextAction ? "ink" : "gray"} weight={work.nextAction ? "semibold" : "regular"} numberOfLines={2}>{sub}</Text> : null}
        <View style={s.foot}>
          {when ? <Text variant="caption" tone="gray2" numberOfLines={1}>{when}</Text> : null}
          {work.hasChat ? <Icon name="message-circle" size={13} color={c.accent} /> : null}
          {work.hasMeeting ? <Icon name="video" size={13} color={c.accent} /> : null}
        </View>
      </View>
      <Icon name="chevron-right" size={18} color={c.gray2} />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 14, borderLeftWidth: 1, borderRightWidth: 1 },
  first: { borderTopWidth: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  last: { borderBottomWidth: 1, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  main: { flex: 1, minWidth: 0, gap: 3 },
  idRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  id: { letterSpacing: 0.3, flexShrink: 1 },
  pill: { marginLeft: "auto", maxWidth: "62%" },
  title: { fontSize: 17, lineHeight: 22 },
  foot: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 1 },
});
