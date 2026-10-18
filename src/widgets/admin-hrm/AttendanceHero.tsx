import { View } from "react-native";
import { fmtMinutes, type AttendanceDay } from "@/entities/admin-hrm";
import { CcHero } from "@/shared/ui/cc";
import { Card } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { DayStrip } from "./DayStrip";

// Summary of the loaded period: total worked time, present / late / absent days, plus the day heat strip.
export function AttendanceHero({ days }: { days: AttendanceDay[] }) {
  const { t } = useT();
  const worked = days.reduce((a, d) => a + d.worked, 0);
  const late = days.filter((d) => d.late > 0).length;
  const absent = days.filter((d) => d.status === "absent").length;
  const present = days.filter((d) => d.worked > 0 || d.status === "present").length;
  return (
    <View style={{ gap: 10 }}>
      <CcHero
        stats={[{ value: fmtMinutes(worked, t), label: t("admHrmW.workedTotal") }, { value: String(present), label: t("admHrmW.daysPresent"), color: "#22C55E" }]}
        segments={[
          { key: "p", value: Math.max(0, present - late), color: "#22C55E", label: t("admHrmW.daysPresent") },
          { key: "l", value: late, color: "#F59E0B", label: `${t("admHrmW.daysLate")} · ${late}` },
          { key: "a", value: absent, color: "#EF4444", label: `${t("admHrmW.daysAbsent")} · ${absent}` },
        ]}
      />
      {days.length ? <Card style={{ padding: 14 }}><DayStrip days={days} title={t("admHrmW.last30")} /></Card> : null}
    </View>
  );
}
