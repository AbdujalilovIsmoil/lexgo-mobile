import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useAccess } from "@/entities/access";
import { useMyMessages, useMyTasks } from "@/entities/admin-hrm";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Home feature card for the internal (HRM) area: my open tasks and messages at a glance; a tap jumps to the HRM tab.
export function HrmFeature() {
  const { t } = useT();
  const router = useRouter();
  const internal = useAccess().internal;
  const tasks = useMyTasks("", "");
  const msgs = useMyMessages();
  if (!internal) return null;
  const stat = (n: number | undefined, label: string) => (
    <View style={s.stat}><Text variant="h3" tone="white">{n ?? "—"}</Text><Text variant="caption" style={s.sub} numberOfLines={1}>{label}</Text></View>
  );
  return (
    <Animated.View entering={FadeInUp.duration(360)} style={s.wrap}>
      <PressableScale onPress={() => router.navigate("/(tabs)/hrm" as never)} scale={0.98} accessibilityRole="button" accessibilityLabel={t("admHub.mod.internal.title")}>
        <LinearGradient colors={["#4F46E5", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
          <View style={s.top}>
            <View style={s.icon}><Icon name="users" size={20} tone="white" /></View>
            <View style={s.fill}><Text variant="h4" tone="white">{t("admHub.mod.internal.title")}</Text><Text variant="caption" style={s.sub} numberOfLines={1}>{t("admHrm.hubLead")}</Text></View>
            <Icon name="arrow-right" size={20} tone="white" />
          </View>
          <View style={s.row}>{stat(tasks.data?.length, t("admHrm.nav.tasks"))}{stat(msgs.data?.length, t("admHrm.nav.messages"))}</View>
        </LinearGradient>
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 18 },
  card: { borderRadius: 24, padding: 16, gap: 14 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  fill: { flex: 1 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  sub: { color: "#E0E7FF" },
  row: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
});
