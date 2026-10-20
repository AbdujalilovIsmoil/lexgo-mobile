import { ActivityIndicator, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, LevelBars, LiveDot, PressableScale, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { MAX_VOICE_SEC, type useVoiceRecorder } from "../model/useVoiceRecorder";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// The recorder card, on screen from the very tap (it says "getting ready" while the permission and the recorder start, then
// "recording"): live light, level bars, the timer against the limit with a progress line, and the two buttons — cancel and a
// big round stop — which are there from the first frame (stop waits until the recording has really begun).
export function VoiceLive({ r }: { r: ReturnType<typeof useVoiceRecorder> }) {
  const { t } = useT();
  const c = useColors();
  return (
    <Animated.View entering={FadeInDown.duration(220)} style={[s.card, { backgroundColor: c.errBg, borderColor: c.err }]} accessibilityLiveRegion="polite">
      <View style={s.top}>
        <View style={s.col}>
          <View style={s.row}><LiveDot color={c.err} size={9} /><Text variant="small" weight="bold" style={{ color: c.err }}>{t(r.recording ? "vcx.recording" : "vcx.starting")}</Text></View>
          <Text variant="h2">{mmss(r.seconds)}<Text variant="small" tone="gray">  / {mmss(MAX_VOICE_SEC)}</Text></Text>
        </View>
        <LevelBars color={c.err} live={r.recording} />
      </View>
      <View style={[s.track, { backgroundColor: c.line }]}><View style={[s.fill, { width: `${Math.min(100, (r.seconds / MAX_VOICE_SEC) * 100)}%`, backgroundColor: c.err }]} /></View>
      <View style={s.actions}>
        <PressableScale onPress={() => void r.cancel()} accessibilityRole="button" accessibilityLabel={t("vcx.cancel")} style={[s.cancel, { borderColor: c.glassLine, backgroundColor: c.glassFill }]}>
          <Icon name="trash-2" size={18} color={c.gray} /><Text variant="small" weight="bold" tone="gray">{t("vcx.cancel")}</Text>
        </PressableScale>
        <PressableScale onPress={() => void r.stop()} disabled={!r.recording} accessibilityRole="button" accessibilityLabel={t("vcx.stop")} style={[s.stop, { backgroundColor: c.err, opacity: r.recording ? 1 : 0.6 }]}>
          {r.recording ? <Icon name="square" size={18} color="#FFFFFF" /> : <ActivityIndicator size="small" color="#FFFFFF" />}
          <Text variant="body" weight="bold" tone="white">{t("vcx.stop")}</Text>
        </PressableScale>
      </View>
      <Text variant="caption" tone="gray">{t("vcx.hint")}</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { gap: 12, padding: 14, borderRadius: radius.rl, borderWidth: 1 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  col: { gap: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  track: { height: 4, borderRadius: 2, overflow: "hidden" },
  fill: { height: 4, borderRadius: 2 },
  actions: { flexDirection: "row", gap: 10 },
  cancel: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16, height: 50, borderRadius: 25, borderWidth: 1.5 },
  stop: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 50, borderRadius: 25 },
});
