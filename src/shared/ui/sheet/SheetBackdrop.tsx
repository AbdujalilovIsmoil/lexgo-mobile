import { Pressable, StyleSheet } from "react-native";
import { useT } from "@/shared/i18n";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";

// Dark layer behind the sheet; tapping it dismisses the sheet.
export function SheetBackdrop({ height, low, onPress }: { height: SharedValue<number>; low: number; onPress: () => void }) {
  const { t } = useT();
  const dim = useAnimatedStyle(() => ({ opacity: interpolate(height.value, [0, low], [0, 0.55], Extrapolation.CLAMP) }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }, dim]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onPress} accessibilityRole="button" accessibilityLabel={t("a11y.close")} />
    </Animated.View>
  );
}
