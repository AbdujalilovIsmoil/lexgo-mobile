import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { BusinessHours } from "@/entities/admin-callcenter";
import { GradientBox, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Header of the call-center hub: a live pulse, the working-hours state and a one-line brief.
export function HubHero() {
  const { t } = useT();
  const pulse = useSharedValue(0);
  useEffect(() => { pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1); }, [pulse]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.4 * (1 - pulse.value), transform: [{ scale: 1 + pulse.value * 0.45 }] }));
  return (
    <GradientBox variant="dark" style={s.box}>
      <View style={s.top}>
        <View style={s.icon}>
          <Animated.View style={[s.ring, ring]} />
          <Icon name="headphones" size={22} tone="white" />
        </View>
        <View style={s.fill}>
          <Text variant="h3" tone="white">{t("admHub.mod.callcenter.title")}</Text>
          <Text variant="caption" style={s.sub}>{t("admCcH.live")}</Text>
        </View>
        <BusinessHours />
      </View>
      <Text variant="small" style={s.sub}>{t("admCcH.brief")}</Text>
    </GradientBox>
  );
}

const s = StyleSheet.create({
  box: { padding: 18, gap: 12 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  fill: { flex: 1 },
  sub: { color: "#B7CDEC" },
  icon: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", width: 46, height: 46, borderRadius: 23, backgroundColor: "#22C55E" },
});
