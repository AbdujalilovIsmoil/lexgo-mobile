import { StyleSheet, View } from "react-native";
import { type WeeklyDay, dayValid } from "@/entities/pro-availability";
import { useColors } from "@/shared/theme";
import { PressableScale, Text, Toggle } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { day: WeeklyDay; onToggle: (on: boolean) => void; onPickTime: (which: "start" | "end") => void };

// One weekday: on/off and the working hours (tap a time to change it).
export function DayRow({ day, onToggle, onPickTime }: Props) {
  const { t } = useT();
  const c = useColors();
  const bad = !dayValid(day);
  const chip = (which: "start" | "end") => (
    <PressableScale onPress={() => onPickTime(which)} style={[s.time, { backgroundColor: c.surface2, borderColor: bad ? c.err : c.line }]}>
      <Text variant="small" weight="bold" style={bad ? { color: c.err } : undefined}>{day[which]}</Text>
    </PressableScale>
  );
  return (
    <View style={s.row}>
      <Text variant="body" weight="semibold" style={[s.name, !day.enabled && { color: c.gray2 }]}>{t(`sl8.day.${day.day}`)}</Text>
      {day.enabled ? (
        <View style={s.times}>{chip("start")}<Text tone="gray">–</Text>{chip("end")}</View>
      ) : (
        <Text variant="small" tone="gray2" style={s.off}>{t("sl8.dayOff")}</Text>
      )}
      <Toggle value={day.enabled} onChange={onToggle} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44 },
  name: { width: 104 },
  times: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  off: { flex: 1 },
  time: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5 },
});
