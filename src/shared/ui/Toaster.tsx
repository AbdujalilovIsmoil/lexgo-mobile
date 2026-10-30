import { Platform, StyleSheet, View } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { useInsets } from "@/shared/lib/insets";
import { GLASS_SOLID, radius, shadows, useTheme } from "@/shared/theme";
import { useToastStore } from "./toastStore";
import { GlassBackdrop, useGlass } from "./GlassBackdrop";
import { Text } from "./Text";
import { Icon, type IconName } from "./Icon";

// Bottom toasts above the tab bar (components/Toaster.tsx on the web).
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const insets = useInsets();
  const { colors: c, dark, glass } = useTheme();
  const lens = !!useGlass();
  const snack = Platform.OS === "android"; // Material 3 snackbar: an inverse surface, 8dp corners, full width, text from the left
  if (!toasts.length) return null;
  const icons: Record<string, IconName> = { info: "info", ok: "check-circle", err: "alert-circle" };
  return (
    <View pointerEvents="none" accessibilityLiveRegion="polite" style={[s.host, { bottom: insets.bottom + 84 }]}>
      {toasts.map((t) => (
        <Animated.View key={t.id} accessible accessibilityRole="alert" accessibilityLabel={t.text} entering={FadeInUp.duration(220)} exiting={FadeOutDown.duration(180)} style={[s.toast, { backgroundColor: lens ? "transparent" : snack ? (dark ? "#E2E8F7" : "#2D3446") : glass ? GLASS_SOLID : dark ? c.surface2 : "#0B1F45" }, snack ? s.snack : shadows.s2]}>
          {lens ? <GlassBackdrop radius={radius.r} tint={dark ? "rgba(8,16,36,0.55)" : "rgba(11,31,69,0.62)"} /> : null}
          <Icon name={icons[t.kind]} size={18} color={t.kind === "err" ? "#FF9494" : t.kind === "ok" ? "#4ADE9F" : "#93C6FF"} />
          <Text variant="small" tone="white" style={[s.text, snack && { color: dark ? "#1A2236" : "#F1F4FB" }]}>
            {t.text}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  host: { position: "absolute", left: 16, right: 16, gap: 8, alignItems: "center" },
  toast: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 16, borderRadius: radius.r, maxWidth: 420 },
  text: { flexShrink: 1 },
  snack: { alignSelf: "stretch", maxWidth: undefined, borderRadius: 8, paddingVertical: 14 },
});
