import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";
import { fmtMinutes, useToday } from "@/entities/admin-hrm";
import { ClockHero } from "@/features/admin-hrm";
import { Card, Icon, Text } from "@/shared/ui";
import { fmtTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

function Fact({ label, value }: { label: string; value: string }) {
  return <View style={{ flex: 1 }}><Text variant="caption" tone="gray">{label}</Text><Text variant="h4">{value}</Text></View>;
}

// Hero of the workday: state (working / finished / not started), in · out · worked, and the big clock-in/out button.
export function AttendanceCard() {
  const { t } = useT();
  const day = useToday().data?.attendance;
  const live = !!day?.firstIn && !day.lastOut;
  const state = !day?.firstIn ? t("admHrm.notStarted") : live ? t("admHrmW.working") : t("admHrmW.finished");
  const color = live ? "#22C55E" : day?.firstIn ? "#3B82F6" : "#64748B";
  return (
    <Animated.View entering={FadeInUp.duration(220)}>
      <Card style={s.card}>
        <LinearGradient colors={[`${color}33`, "transparent"]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
        <View style={s.head}>
          <View style={[s.ico, { backgroundColor: `${color}33` }]}><Icon name={live ? "activity" : "clock"} size={20} color={color} /></View>
          <View style={{ flex: 1 }}>
            <Text variant="caption" tone="gray">{t("admHrm.attToday")}</Text>
            <Text variant="h3" style={{ color }}>{state}</Text>
          </View>
        </View>
        {day?.firstIn ? (
          <View style={s.head}>
            <Fact label={t("admHrmW.firstIn")} value={fmtTime(day.firstIn)} />
            <Fact label={t("admHrmW.lastOut")} value={day.lastOut ? fmtTime(day.lastOut) : "…"} />
            <Fact label={t("admHrmW.workedToday")} value={fmtMinutes(day.worked, t)} />
          </View>
        ) : <Text variant="small" tone="gray">{t("admHrmW.shiftHint")}</Text>}
        <ClockHero />
      </Card>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { gap: 14, overflow: "hidden" },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  ico: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
