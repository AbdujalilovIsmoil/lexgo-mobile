import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { HrmStatus, useNames, useProfile, useToday } from "@/entities/admin-hrm";
import { useSession } from "@/entities/session";
import { ClockHero } from "@/features/admin-hrm";
import { Avatar, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { HubStats } from "./HubStats";

// Hub hero: who I am, today's attendance with the clock-in button, and the three live numbers.
export function HubHeader() {
  const { t } = useT();
  const names = useNames();
  const today = useToday().data;
  const emp = useProfile().data?.employee;
  const me = useSession()?.user.name;
  const full = today?.name || emp?.name || me || "";
  const pos = emp?.assignment ? names.position(emp.assignment.positionId) : "";
  const att = today?.attendance;
  return (
    <LinearGradient colors={["#4338CA", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
      <View style={s.glow} pointerEvents="none" />
      <View style={s.top}>
        <Avatar name={full || "?"} size={54} />
        <View style={s.fill}>
          <Text variant="h3" tone="white" numberOfLines={1}>{full ? t("admHrm.hello", { name: full.split(" ")[0] }) : t("admHrm.kicker")}</Text>
          {pos ? <Text variant="small" style={s.sub} numberOfLines={1}>{pos}</Text> : null}
        </View>
        <View style={s.pill}>{att ? <HrmStatus status={att.status} /> : <Pill small tone="gray" icon="clock" label={t("admHrm.notStarted")} />}</View>
      </View>
      <View style={s.clock}><ClockHero /></View>
      <HubStats />
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 28, padding: 16, gap: 14, marginBottom: 18, overflow: "hidden" },
  glow: { position: "absolute", top: -70, right: -50, width: 190, height: 190, borderRadius: 95, backgroundColor: "rgba(255,255,255,0.12)" },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  fill: { flex: 1, gap: 2 },
  sub: { color: "#E0E7FF" },
  pill: { backgroundColor: "rgba(10,21,38,0.55)", borderRadius: 999, padding: 2 },
  clock: { backgroundColor: "rgba(10,21,38,0.45)", borderRadius: 22, padding: 10 },
});
