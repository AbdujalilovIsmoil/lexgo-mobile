import { StyleSheet, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { HOTLINE } from "@/shared/config/contact";
import { openTel } from "@/shared/lib/links";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useInstructorTarget } from "@/shared/instructor";
import { usePulse } from "@/shared/lib/usePulse";

// The hotline as its own tap-to-call strip, always one thumb away under the hero.
export function SosHotline() {
  const { t } = useT();
  const c = useColors();
  const b = usePulse(1100, true);
  const ico = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(b.value, [0, 1], [0.9, 1.12]) }] }));
  const call = useInstructorTarget("sos:call", { label: t("cxSos.callNow"), type: "button" });
  return (
    <View {...call}>
      <PressableScale onPress={() => openTel(HOTLINE)} style={[s.bar, { backgroundColor: c.surface, borderColor: c.line }]} accessibilityRole="button">
        <Animated.View style={[s.phone, ico]}><Icon name="phone" size={20} tone="white" /></Animated.View>
        <View style={s.fill}>
          <Text variant="caption" tone="gray">{t("cxSos.callNow")}</Text>
          <Text variant="h4">{HOTLINE}</Text>
        </View>
        <Icon name="chevron-right" size={20} tone="gray" />
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: radius.rl, borderWidth: 1.5 },
  phone: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#E11D48" },
  fill: { flex: 1 },
});
