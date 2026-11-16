import { Platform, StyleSheet, View } from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";
import { useInsets } from "@/shared/lib/insets";
import { useTheme } from "@/shared/theme";
import { useToastStore } from "./toastStore";
import { Text } from "./Text";
import { Icon, type IconName } from "./Icon";

// It drops in from above the screen's top edge and goes back up the same way.
const ENTER = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: -90 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }], easing: Easing.out(Easing.cubic) },
}).duration(260);
const EXIT = new Keyframe({
  0: { opacity: 1, transform: [{ translateY: 0 }] },
  100: { opacity: 0, transform: [{ translateY: -90 }], easing: Easing.in(Easing.cubic) },
}).duration(220);

const ICON: Record<string, IconName> = { info: "info", ok: "check", err: "alert-circle" };
const DOT: Record<string, string> = { info: "#2B54D6", ok: "#2B54D6", err: "#E5484D" };

// Toasts at the top of the screen (Adliya): a navy card the width of the page, a round icon on the left, the text in white. Each stays 2.5 s
// (toastStore), the same on iOS and Android.
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const insets = useInsets();
  const { dark } = useTheme();
  if (!toasts.length) return null;
  return (
    <View pointerEvents="none" accessibilityLiveRegion="polite" style={[s.host, { top: insets.top + 8 }]}>
      {toasts.map((t) => (
        <Animated.View key={t.id} accessible accessibilityRole="alert" accessibilityLabel={t.text} entering={ENTER} exiting={EXIT} style={[s.toast, { backgroundColor: dark ? "#1A2D5C" : "#0F2149" }]}>
          <View style={[s.dot, { backgroundColor: DOT[t.kind] }]}>
            <Icon name={ICON[t.kind]} size={15} color="#FFFFFF" />
          </View>
          <Text variant="body" weight="bold" tone="white" style={s.text} maxFontSizeMultiplier={1.3}>
            {t.text}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  host: { position: "absolute", left: 14, right: 14, gap: 8 },
  toast: {
    flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 14, borderRadius: 18, alignSelf: "stretch", maxWidth: 520,
    ...Platform.select({ ios: { shadowColor: "#0A1F44", shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } }, default: { elevation: 10 } }),
  },
  dot: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, fontSize: 15.5, lineHeight: 21 },
});
