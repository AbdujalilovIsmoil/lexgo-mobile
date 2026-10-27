import { StyleSheet, View } from "react-native";
import { Card, PressableScale, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/charts";
import { useTaskStats } from "@/entities/team-tasks";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { onOpen?: (field: "created" | "completed") => void };

// The day at a glance, as on the web: given today, done today, still open (with how many are late), and a bar of how many of all the
// tasks are ready; a line says how many have nobody on them. "Given today" and "done today" open exactly those tasks: the same day by
// creation / by completion (TZ.md: a card's list uses its own period field).
export function TaskKpis({ onOpen }: Props) {
  const { t } = useT();
  const c = useColors();
  const s = useTaskStats().data;
  if (!s) return null;
  const cell = (n: number, label: string, color?: string, field?: "created" | "completed") => {
    const body = (
      <>
        <Text variant="h2" style={color ? { color } : undefined}>{n}</Text>
        <Text variant="caption" tone="gray" numberOfLines={2}>{label}</Text>
      </>
    );
    return field && onOpen ? <PressableScale onPress={() => onOpen(field)} accessibilityRole="button" accessibilityLabel={label} style={s2.cell}>{body}</PressableScale> : <View style={s2.cell}>{body}</View>;
  };
  return (
    <Card style={s2.card}>
      <View style={s2.row}>
        {cell(s.created, t("ttm.kpi.created"), undefined, "created")}
        {cell(s.readyInPeriod, t("ttm.kpi.done"), c.ok, "completed")}
        {cell(s.active, t("ttm.kpi.open"), s.overdue ? c.err : undefined)}
      </View>
      <View style={s2.prog}>
        <Text variant="small" weight="bold">{t("ttm.progress.title")}</Text>
        <ProgressBar value={s.total ? s.ready / s.total : 0} color={c.ok} />
        <Text variant="caption" tone="gray">{t("ttm.progress.foot", { total: s.total, done: s.ready })}</Text>
        {s.overdue ? <Text variant="caption" weight="semibold" style={{ color: c.err }}>{t("ttm.progress.late", { n: s.overdue })}</Text> : null}
        {s.unassigned ? <Text variant="caption" weight="semibold" style={{ color: c.warn }}>{t("ttm.kpi.unassigned", { n: s.unassigned })}</Text> : null}
      </View>
    </Card>
  );
}

const s2 = StyleSheet.create({ card: { gap: 14 }, row: { flexDirection: "row", gap: 10 }, cell: { flex: 1, gap: 2 }, prog: { gap: 6 } });
