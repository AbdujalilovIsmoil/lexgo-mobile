import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { Availability } from "@/entities/pro-availability";
import { DayRow, TimeSheet } from "@/features/pro-availability-edit";
import { Button } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

type Props = {
  value: Availability;
  setDay: (day: number, p: { enabled?: boolean; start?: string; end?: string }) => void;
  spread: () => void;
  weekdays: () => void;
};

// Monday–Sunday schedule: switch a day on/off, tap a time to change it; two shortcuts for the common weeks.
export function WeekCard({ value, setDay, spread, weekdays }: Props) {
  const { t } = useT();
  const [pick, setPick] = useState<{ day: number; which: "start" | "end" } | null>(null);
  const cur = pick ? value.weekly.find((d) => d.day === pick.day) : undefined;
  return (
    <SectionCard title={t("sl8.week")}>
      {value.weekly.map((d) => (
        <DayRow key={d.day} day={d} onToggle={(on) => setDay(d.day, { enabled: on })} onPickTime={(which) => setPick({ day: d.day, which })} />
      ))}
      <View style={s.row}>
        <Button title={t("sl8.spread")} variant="soft" size="sm" icon="copy" onPress={spread} />
        <Button title={t("sl8.weekdays")} variant="soft" size="sm" icon="calendar" onPress={weekdays} />
      </View>
      <TimeSheet visible={!!pick} onClose={() => setPick(null)} title={pick ? `${t(`sl8.day.${pick.day}`)} · ${t(pick.which === "start" ? "sl8.from" : "sl8.to")}` : ""} value={pick && cur ? cur[pick.which] : "09:00"} onPick={(hm) => pick && setDay(pick.day, { [pick.which]: hm })} />
    </SectionCard>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", gap: 8, flexWrap: "wrap" } });
