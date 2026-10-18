import { StyleSheet, View } from "react-native";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { Card, Text } from "@/shared/ui";
import { assigneeLabel, categoryLabel, leadTitle, regionLabel, scoreLabel, sourceLabel } from "../model/labels";
import type { Lead, Operator } from "../model/types";
import { AssigneeChip, ScorePill, ShiftButton, StageChip } from "./LeadChips";

type Props = {
  lead: Lead;
  stageTitle: string;
  stageColor: string;
  ops: Operator[];
  meId: string;
  canBack: boolean;
  canFwd: boolean;
  busy?: boolean;
  onOpen: () => void;
  onShift: (dir: -1 | 1) => void;
  onStage: () => void;
};

// One lead on the board: who, what, which stage and operator — with arrows to move it a stage back or forward.
export function LeadCard({ lead, stageTitle, stageColor, ops, meId, canBack, canFwd, busy, onOpen, onShift, onStage }: Props) {
  const { t, locale } = useT();
  const meta = [lead.phone, categoryLabel(t, lead.category), regionLabel(t, lead.region)].filter(Boolean).join(" · ");
  const origin = [sourceLabel(t, lead.source), fmtDate(lead.createdAt, locale)].filter(Boolean).join(" · ");
  return (
    <Card onPress={onOpen} style={s.card}>
      <View style={s.row}>
        <Text variant="body" weight="bold" numberOfLines={2} style={s.fill}>{leadTitle(t, lead)}</Text>
        {lead.score ? <ScorePill score={lead.score} label={scoreLabel(t, lead.score)} /> : null}
      </View>
      <Text variant="small" tone="gray" numberOfLines={1}>{meta || t("admLeads.noInfo")}</Text>
      {lead.note ? <Text variant="caption" tone="gray2" numberOfLines={2}>{lead.note}</Text> : null}
      {origin ? <Text variant="caption" tone="gray2" numberOfLines={1}>{origin}</Text> : null}
      <View style={[s.row, s.foot]}>
        <StageChip title={stageTitle} color={stageColor} onPress={onStage} />
        <AssigneeChip label={assigneeLabel(t, ops, lead.assignedTo, meId)} kind={!lead.assignedTo ? "none" : lead.assignedTo === meId ? "me" : "op"} />
        <View style={s.fill} />
        <ShiftButton icon="chevron-left" disabled={!canBack || !!busy} onPress={() => onShift(-1)} />
        <ShiftButton icon="chevron-right" disabled={!canFwd || !!busy} onPress={() => onShift(1)} />
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, gap: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  fill: { flex: 1 },
  foot: { marginTop: 8 },
});
