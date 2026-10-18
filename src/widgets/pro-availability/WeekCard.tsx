import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { Availability } from "@/entities/pro-availability";
import { DayRow, TimeSheet } from "@/features/pro-availability-edit";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { Notice } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";

type Props = {
  value: Availability;
  setDay: (day: number, p: { enabled?: boolean; start?: string; end?: string }) => void;
  copyAll: (day: number) => void;
  noDay: boolean;
};

// Monday–Sunday planner: seven compact rows (switch, time chips, 24 h bar); the time chips open a stepper sheet.
export function WeekCard({ value, setDay, copyAll, noDay }: Props) {
  const { t } = useT();
  const c = useColors();
  const [pick, setPick] = useState<{ day: number; which: "start" | "end" } | null>(null);
  const cur = pick ? value.weekly.find((d) => d.day === pick.day) : undefined;
  return (
    <SectionCard title={t("sl8.week")}>
      <View>
        {value.weekly.map((d, i) => (
          <View key={d.day} style={i > 0 && [s.sep, { borderTopColor: c.line }]}>
            <DayRow day={d} onToggle={(on) => setDay(d.day, { enabled: on })} onPickTime={(which) => setPick({ day: d.day, which })} onCopyAll={() => copyAll(d.day)} />
          </View>
        ))}
      </View>
      {noDay ? <Notice tone="err" text={t("sl8.issue.noDay")} /> : <Text variant="caption" tone="gray2">{t("availUx.weekHint")}</Text>}
      <TimeSheet
        visible={!!pick}
        onClose={() => setPick(null)}
        title={pick ? `${t(`sl8.day.${pick.day}`)} · ${t(pick.which === "start" ? "sl8.from" : "sl8.to")}` : ""}
        value={pick && cur ? cur[pick.which] : "09:00"}
        which={pick?.which ?? "start"}
        other={pick && cur ? cur[pick.which === "start" ? "end" : "start"] : "18:00"}
        onPick={(hm) => pick && setDay(pick.day, { [pick.which]: hm })}
      />
    </SectionCard>
  );
}

const s = StyleSheet.create({ sep: { borderTopWidth: 1 } });
