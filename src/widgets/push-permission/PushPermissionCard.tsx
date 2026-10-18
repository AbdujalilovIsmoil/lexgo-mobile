import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalPrefs, useSnoozed } from "@/entities/notification";
import { useT } from "@/shared/i18n";
import { askPermission, openSystemSettings, usePushPermission } from "@/shared/push";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { RingingBell } from "./RingingBell";

const SNOOZE_MS = 3 * 86_400_000;
const SKY = ["#0B1F45", "#123A86", "#0E7FD0"] as const;
const AMBER = ["#3A2A0E", "#6B4A12", "#B7791F"] as const;

// Notification permission, asked in context: a gradient card with a swinging bell, one big "Enable" button and a
// quiet "Later" (hides it 3 days). When the OS will not ask again the button opens system settings.
export function PushPermissionCard({ always }: { always?: boolean }) {
  const { t } = useT();
  const perm = usePushPermission();
  const snoozed = useSnoozed();
  const patch = useLocalPrefs((s) => s.patch);
  if (!perm.loaded) return null;
  const granted = perm.status === "granted";
  if (!always && (granted || snoozed)) return null;
  const blocked = perm.status === "denied" && !perm.canAskAgain;
  const ask = () => void askPermission().then(() => patch({ askedAt: Date.now() }));
  if (granted) {
    return (
      <View style={s.on}>
        <Icon name="check-circle" size={18} color="#3DDC97" />
        <View style={s.fill}>
          <Text variant="small" weight="bold">{t("nt2.perm.onTitle")}</Text>
          <Text variant="caption" tone="gray">{t("nt2.perm.onText")}</Text>
        </View>
      </View>
    );
  }
  return (
    <LinearGradient colors={[...(blocked ? AMBER : SKY)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
      <View style={s.glow} pointerEvents="none" />
      <View style={s.head}>
        <RingingBell icon={blocked ? "bell-off" : "bell"} color="#FFFFFF" ring={!blocked} />
        <View style={s.fill}>
          <Text variant="h4" tone="white">{t(blocked ? "nt2.perm.blockedTitle" : "nt2.perm.title")}</Text>
          <Text variant="small" style={s.txt}>{t(blocked ? "nt2.perm.blockedText" : "nt2.perm.text")}</Text>
        </View>
      </View>
      <PressableScale onPress={blocked ? openSystemSettings : ask} style={s.cta} accessibilityRole="button">
        <Icon name={blocked ? "settings" : "bell"} size={17} color="#0B1F45" />
        <Text variant="body" weight="bold" style={s.ctaTx}>{t(blocked ? "nt2.perm.settings" : "nt2.perm.enable")}</Text>
      </PressableScale>
      {!always ? (
        <PressableScale onPress={() => patch({ snoozeUntil: Date.now() + SNOOZE_MS })} style={s.later} hitSlop={8}>
          <Text variant="small" weight="semibold" style={s.laterTx}>{t("nt2.perm.later")}</Text>
        </PressableScale>
      ) : null}
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 10, borderRadius: 24, padding: 16, gap: 14, overflow: "hidden" },
  glow: { position: "absolute", top: -70, right: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(0,207,232,0.22)" },
  head: { flexDirection: "row", alignItems: "center", gap: 14 },
  fill: { flex: 1, gap: 2 },
  txt: { color: "#D6E6FF" },
  cta: { height: 48, borderRadius: 24, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  ctaTx: { color: "#0B1F45" },
  later: { alignSelf: "center", paddingVertical: 2 },
  laterTx: { color: "#C4DEFF" },
  on: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginBottom: 10, padding: 12, borderRadius: 16, backgroundColor: "rgba(61,220,151,0.12)" },
});
