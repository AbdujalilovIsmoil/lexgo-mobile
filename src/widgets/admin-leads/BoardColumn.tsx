import { StyleSheet, View } from "react-native";
import { LeadCard, columnTitle, type Column, type Lead, type Operator } from "@/entities/admin-leads";
import { Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = {
  col: Column; at: number; last: number; width: number; filtered: boolean; ops: Operator[]; meId: string; busyId: string;
  onOpen: (l: Lead) => void; onShift: (l: Lead, dir: -1 | 1) => void; onStage: (l: Lead) => void;
};

// One kanban column: colour dot, title, lead count and its cards (the same card as the list view).
export function BoardColumn({ col, at, last, width, filtered, ops, meId, busyId, onOpen, onShift, onStage }: Props) {
  const { t } = useT();
  const c = useColors();
  const title = columnTitle(t, col);
  return (
    <View style={[s.col, { width, backgroundColor: c.surface2, borderColor: c.line }]}>
      <View style={s.head}>
        <View style={[s.dot, { backgroundColor: col.color || c.gray2 }]} />
        <Text variant="body" weight="bold" numberOfLines={1} style={s.fill}>{title}</Text>
        <View style={[s.count, { backgroundColor: c.surface }]}><Text variant="caption" weight="bold">{filtered ? col.leads.length : col.count}</Text></View>
      </View>
      {col.leads.length ? col.leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} stageTitle={title} stageColor={col.color} showStage={false} ops={ops} meId={meId} canBack={at > 0} canFwd={at < last} busy={busyId === lead.id} onOpen={() => onOpen(lead)} onShift={(d) => onShift(lead, d)} onStage={() => onStage(lead)} />
      )) : <Text variant="small" tone="gray2" center style={s.empty}>{t(filtered ? "admLeads.noMatch" : "admLeadsV.none")}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  col: { borderRadius: 22, borderWidth: 1.5, padding: 10, gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4, paddingTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  fill: { flex: 1 },
  count: { minWidth: 26, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  empty: { paddingVertical: 24 },
});
