import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { Avatar, Icon, PressableScale, Text } from "@/shared/ui";
import type { Incoming } from "@/features/call";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// Full-screen ring: a pulsing halo around the caller, what for, Decline / Join.
export function IncomingCard({ inc, onAccept, onDecline }: { inc: Incoming; onAccept: () => void; onDecline: () => void }) {
  const { t } = useT();
  const insets = useInsets();
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }), -1, false);
  }, [p]);
  const halo = useAnimatedStyle(() => ({ opacity: 0.55 * (1 - p.value), transform: [{ scale: 1 + p.value * 0.7 }] }));
  const who = inc.callerName || t("admMeet.someone");
  return (
    <View style={[s.fill, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
      <View style={s.top}>
        <View style={s.ring}><Animated.View style={[s.halo, halo]} /><Avatar name={who} size={104} /></View>
        <Text variant="h2" tone="white" center>{who}</Text>
        <Text variant="body" center style={s.sub}>{inc.type === "audio" ? t("admMeet.invitesAudio") : t("admMeet.invitesVideo")}</Text>
        {inc.title ? <Text variant="small" center style={s.title}>{inc.title}</Text> : null}
      </View>
      <View style={s.acts}>
        <PressableScale onPress={onDecline} style={s.item} accessibilityLabel={t("admMeet.decline")}>
          <View style={[s.btn, { backgroundColor: "#E5484D" }]}><Icon name="phone-off" size={28} color="#FFFFFF" /></View>
          <Text variant="small" tone="white">{t("admMeet.decline")}</Text>
        </PressableScale>
        <PressableScale onPress={onAccept} style={s.item} accessibilityLabel={t("admMeet.join")}>
          <View style={[s.btn, { backgroundColor: "#22A06B" }]}><Icon name={inc.type === "audio" ? "phone" : "video"} size={28} color="#FFFFFF" /></View>
          <Text variant="small" tone="white">{t("admMeet.join")}</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "rgba(3,16,43,0.97)", justifyContent: "space-between", paddingHorizontal: 24 },
  top: { alignItems: "center", gap: 10 },
  ring: { padding: 8, borderRadius: 70, borderWidth: 2, borderColor: "rgba(110,168,255,0.5)", marginBottom: 10, alignItems: "center", justifyContent: "center" },
  halo: { position: "absolute", width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(110,168,255,0.6)" },
  sub: { color: "#A5B4C8" },
  title: { color: "#CFE2FF" },
  acts: { flexDirection: "row", justifyContent: "space-around" },
  item: { alignItems: "center", gap: 8 },
  btn: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
});
