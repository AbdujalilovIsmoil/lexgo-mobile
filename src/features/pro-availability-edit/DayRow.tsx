import { StyleSheet, View } from "react-native";
import { type WeeklyDay, rangeMinutes, rangeValid } from "@/entities/pro-availability";
import { radius, useColors } from "@/shared/theme";
import { IconButton, PressableScale, Text, Toggle } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { DayBar } from "./DayBar";

type Props = {
  day: WeeklyDay;
  onToggle: (on: boolean) => void;
  onPickTime: (which: "start" | "end") => void;
  onCopyAll: () => void;
};

// One weekday: switch, the two time chips (tap to change), its length, a 24 h bar and an inline error.
export function DayRow({ day, onToggle, onPickTime, onCopyAll }: Props) {
  const { t } = useT();
  const c = useColors();
  const name = t(`sl8.day.${day.day}`);
  const bad = day.enabled && !rangeValid(day.start, day.end);
  const mins = rangeMinutes(day.start, day.end);
  const len = mins % 60 ? t("availUx.hoursMin", { h: Math.floor(mins / 60), m: mins % 60 }) : t("availUx.hours", { h: mins / 60 });
  const chip = (which: "start" | "end") => (
    <PressableScale
      onPress={() => onPickTime(which)}
      accessibilityLabel={t(which === "start" ? "availUx.timeFrom" : "availUx.timeTo", { day: name, time: day[which] })}
      style={[s.time, { backgroundColor: c.surface2, borderColor: bad ? c.err : c.line }]}
    >
      <Text variant="body" weight="bold" style={bad ? { color: c.err } : undefined}>{day[which]}</Text>
    </PressableScale>
  );
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Toggle value={day.enabled} onChange={onToggle} label={t("availUx.openDay", { day: name })} />
        <Text variant="body" weight="semibold" style={[s.name, !day.enabled && { color: c.gray2 }]} numberOfLines={1}>{name}</Text>
        {day.enabled ? (
          <IconButton icon="copy" size={44} label={t("availUx.copyAllFor", { day: name })} onPress={onCopyAll} />
        ) : (
          <Text variant="small" tone="gray2">{t("sl8.dayOff")}</Text>
        )}
      </View>
      {day.enabled ? (
        <View style={s.body}>
          <View style={s.times}>
            {chip("start")}
            <Text tone="gray">–</Text>
            {chip("end")}
            {!bad && mins > 0 ? <Text variant="caption" tone="gray" style={s.len} numberOfLines={1}>{len}</Text> : null}
          </View>
          <DayBar start={day.start} end={day.end} />
          {bad ? <Text variant="caption" style={{ color: c.err }}>{t("sl8.issue.hours")}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingVertical: 10, gap: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 44 },
  name: { flex: 1 },
  body: { gap: 8, paddingLeft: 2 },
  times: { flexDirection: "row", alignItems: "center", gap: 8 },
  time: { minHeight: 44, minWidth: 84, paddingHorizontal: 14, borderRadius: radius.r, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  len: { flex: 1, textAlign: "right" },
});
