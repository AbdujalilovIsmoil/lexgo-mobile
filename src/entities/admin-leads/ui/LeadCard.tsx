import { StyleSheet, View } from "react-native";
import { timeAgo } from "@/shared/lib/format";
import { openTel } from "@/shared/lib/links";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { Card, Icon, PressableScale, Text } from "@/shared/ui";
import { assigneeLabel, categoryLabel, leadTitle, regionLabel, scoreLabel, sourceLabel } from "../model/labels";
import type { Lead, Operator } from "../model/types";
import { AssigneeChip, LeadTag, ScorePill, ShiftButton, StageChip } from "./LeadChips";

type Props = {
  lead: Lead;
  stageTitle: string;
  stageColor: string;
  /** false on the board: the column already names the stage. */
  showStage?: boolean;
  ops: Operator[];
  meId: string;
  canBack: boolean;
  canFwd: boolean;
  busy?: boolean;
  onOpen: () => void;
  onShift: (dir: -1 | 1) => void;
  onStage: () => void;
};

// One lead, laid out like the web card: name and temperature, the phone (a tap calls), the category / region / source tags,
// then the operator and how old the lead is. The arrows move it a stage back or forward (the web drags the card).
export function LeadCard({ lead, stageTitle, stageColor, showStage = true, ops, meId, canBack, canFwd, busy, onOpen, onShift, onStage }: Props) {
  const { t } = useT();
  const c = useColors();
  const title = leadTitle(t, lead);
  const category = categoryLabel(t, lead.category);
  const tags = [title === category ? "" : category, regionLabel(t, lead.region), sourceLabel(t, lead.source)].filter(Boolean);
  const age = timeAgo(lead.createdAt, t);
  return (
    <Card onPress={onOpen} style={s.card}>
      <View style={s.row}>
        <Text variant="body" weight="bold" numberOfLines={2} style={s.fill}>{title}</Text>
        {lead.score ? <ScorePill score={lead.score} label={scoreLabel(t, lead.score)} /> : null}
      </View>
      {lead.phone && lead.phone !== title ? (
        <PressableScale onPress={() => openTel(lead.phone)} hitSlop={6} style={s.phone} accessibilityRole="link">
          <Icon name="phone" size={13} tone="accent" />
          <Text variant="small" weight="semibold" tone="accent">{lead.phone}</Text>
        </PressableScale>
      ) : null}
      {showStage || tags.length ? (
        <View style={s.tags}>
          {showStage ? <StageChip title={stageTitle} color={stageColor} onPress={onStage} /> : null}
          {tags.map((x) => <LeadTag key={x} label={x} />)}
        </View>
      ) : null}
      {lead.note ? <Text variant="caption" tone="gray2" numberOfLines={2}>{lead.note}</Text> : null}
      <View style={[s.row, s.foot, { borderTopColor: c.line }]}>
        <AssigneeChip label={assigneeLabel(t, ops, lead.assignedTo, meId)} kind={!lead.assignedTo ? "none" : lead.assignedTo === meId ? "me" : "op"} />
        <View style={s.fill} />
        {age ? <Text variant="caption" tone="gray2" numberOfLines={1}>{age}</Text> : null}
        <ShiftButton icon="chevron-left" disabled={!canBack || !!busy} onPress={() => onShift(-1)} />
        <ShiftButton icon="chevron-right" disabled={!canFwd || !!busy} onPress={() => onShift(1)} />
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  fill: { flex: 1 },
  phone: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" },
  tags: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  foot: { marginTop: 2, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
});
