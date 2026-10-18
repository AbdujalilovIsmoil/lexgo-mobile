import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Text } from "@/shared/ui";
import type { Invited } from "@/entities/call";
import { fmtTime } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// A meeting that is running right now: green card, a pulsing "live" dot and one big Join button.
export function LiveCard({ item, mine, onJoin, onOpen }: { item: Invited; mine: boolean; onJoin: () => void; onOpen: () => void }) {
  const { t } = useT();
  const p = useSharedValue(0);
  useEffect(() => { p.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }), -1); }, [p]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.7 * (1 - p.value), transform: [{ scale: 1 + p.value * 1.4 }] }));
  return (
    <LinearGradient colors={["#0E7A4F", "#16A34A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
      <View style={s.top}>
        <View style={s.dotBox}><Animated.View style={[s.ring, ring]} /><View style={s.dot} /></View>
        <Text variant="caption" weight="bold" tone="white">{t("ms7.live").toUpperCase()}</Text>
        <Text variant="caption" style={s.sub}>· {fmtTime(item.startedAt)}{item.autoEndAt ? ` – ${fmtTime(item.autoEndAt)}` : ""}</Text>
      </View>
      <Text variant="h4" tone="white" numberOfLines={2} onPress={onOpen}>{item.title || t("admMeet.untitled")}</Text>
      <Text variant="small" style={s.sub} numberOfLines={1}>{mine ? t("admMeet.hostedByYou") : t("admMeet.hostedBy", { name: item.callerName || t("admMeet.someone") })}</Text>
      <Button title={t(mine || item.status === "joined" ? "admMeet.rejoin" : "admMeet.join")} icon={item.type === "audio" ? "phone" : "video"} variant="soft" onPress={onJoin} full />
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 24, padding: 16, gap: 8 },
  top: { flexDirection: "row", alignItems: "center", gap: 8 },
  dotBox: { width: 16, height: 16, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" },
  sub: { color: "#D1FAE5" },
});
