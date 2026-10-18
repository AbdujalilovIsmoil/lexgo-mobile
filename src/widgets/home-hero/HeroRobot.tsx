import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { openInstructor } from "@/features/instructor";
import { PressableScale, Text } from "@/shared/ui";
import { RobotView } from "@/shared/robot/RobotView";
import { useRobotWave } from "@/shared/robot/useRobotWave";
import { useT } from "@/shared/i18n";

const W = 150; // robot slot width
const H = 250; // robot height; its legs are cut off by the window's bottom edge

// A glass "window" with the LexGo robot looking out of it: the head and waving arm stick out above the frame,
// the legs are hidden behind it. It keeps waving / gesturing; a tap waves, then opens the assistant
// (signed-in users) or the AI chat (visitors).
export function HeroRobot() {
  const { t } = useT();
  const router = useRouter();
  const authed = useIsAuthed();
  const { ref, wave } = useRobotWave(() => (authed ? openInstructor() : router.navigate("/(tabs)/ai")), 500);
  return (
    <PressableScale onPress={wave} scale={0.985} accessibilityRole="button" accessibilityLabel={t("ax2.title")} style={s.wrap}>
      <View style={s.window}>
        <View style={s.text}>
          <Text variant="body" weight="bold" tone="white">{t("ax2.hint")}</Text>
          <Text variant="caption" style={s.sub} numberOfLines={3}>{t("ax2.subtitle")}</Text>
        </View>
      </View>
      <View style={s.clip} pointerEvents="none"><RobotView ref={ref} width={W} height={H} every={4} /></View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 52, height: 118 },
  window: { flex: 1, flexDirection: "row", backgroundColor: "rgba(255,255,255,0.14)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.28)", borderRadius: 26, paddingLeft: 18, paddingRight: W - 8, alignItems: "center" },
  text: { gap: 4 },
  sub: { color: "#C4DEFF" },
  clip: { position: "absolute", right: 6, bottom: 1.5, top: -52, width: W, overflow: "hidden", borderBottomRightRadius: 24, borderBottomLeftRadius: 24, justifyContent: "flex-start" },
});
