import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { dayTint, type AttendanceDay } from "@/entities/admin-hrm";
import { Text } from "@/shared/ui";

const alpha = (d: AttendanceDay) => (d.planned > 0 ? Math.min(1, Math.max(0.35, d.worked / d.planned)) : d.worked > 0 ? 0.8 : 0.35);

// Heat strip: one cell per day (oldest first), colour = status, strength = worked / planned.
export const DayStrip = memo(function DayStrip({ days, title }: { days: AttendanceDay[]; title: string }) {
  const cells = [...days].sort((a, b) => a.date.localeCompare(b.date)).slice(-42);
  return (
    <View style={{ gap: 8 }}>
      <Text variant="caption" tone="gray">{title}</Text>
      <View style={s.wrap}>
        {cells.map((d) => (
          <View key={d.id} style={[s.cell, { backgroundColor: dayTint(d.status), opacity: alpha(d) }]}><Text variant="caption" style={s.day}>{d.date.slice(8, 10)}</Text></View>
        ))}
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  cell: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  day: { color: "#fff", fontSize: 10 },
});
