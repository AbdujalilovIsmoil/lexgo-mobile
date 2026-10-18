import { StyleSheet, View } from "react-native";
import { statusColor, type AttendanceDay } from "@/entities/admin-hrm";
import { Card, Gauge, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const today = () => new Date().toISOString().slice(0, 10);

// Attendance card: a gauge of how many people are in (today's entries, else the whole list) and present / late / absent counters.
export function TimeHero({ days }: { days: AttendanceDay[] }) {
  const { t } = useT();
  const day = days.filter((d) => d.date.slice(0, 10) === today());
  const scope = day.length ? day : days;
  const n = (st: string) => scope.filter((d) => d.status === st).length;
  const here = n("present") + n("late");
  const rows = [["presentN", "present", here - n("late")], ["lateN", "late", n("late")], ["absentN", "absent", n("absent")]] as const;
  return (
    <Card style={s.card}>
      <Gauge value={scope.length ? here / scope.length : 0} text={`${here}/${scope.length}`} label={t(day.length ? "admHrmU.todayGauge" : "admHrmU.listGauge")} color="#22C55E" size={150} />
      <View style={s.col}>
        {rows.map(([label, st, v]) => (
          <View key={st} style={s.row}><View style={[s.dot, { backgroundColor: statusColor(st) }]} /><Text variant="h4">{v}</Text><Text variant="caption" tone="gray" numberOfLines={1} style={s.fill}>{t(`admHrmU.${label}`)}</Text></View>
        ))}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, flexDirection: "row", alignItems: "center", gap: 8 },
  col: { flex: 1, gap: 10, paddingLeft: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  fill: { flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
