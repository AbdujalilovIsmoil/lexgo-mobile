import { Platform, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AURORA, radius, shadows, useColors, useTheme } from "@/shared/theme";
import { PressableScale } from "./PressableScale";

type Props = ViewProps & {
  onPress?: () => void;
  padded?: boolean;
  elevated?: boolean;
  tinted?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Adliya .card: the solid surface, a #E6EBF3 hairline, 18 radius and a soft shadow — the same on iOS and Android (in the glass theme a
// translucent pane, no shadow). The tappable variant scales.
export function Card({ children, onPress, padded = true, elevated, tinted, style, ...rest }: Props) {
  const c = useColors();
  const { dark, glass: glassTheme } = useTheme();
  const glass = glassTheme || (Platform.OS === "ios" && AURORA);
  // the light a glass edge catches: a short bright fade along the top
  const sheen = glass && !tinted ? <LinearGradient pointerEvents="none" colors={dark ? ["rgba(255,255,255,0.10)", "rgba(255,255,255,0)"] : ["rgba(255,255,255,0.85)", "rgba(255,255,255,0)"]} style={s.sheen} /> : null;
  const base: ViewStyle = {
    backgroundColor: tinted ? c.tint : glass ? c.glassFill : c.surface,
    borderColor: glass ? c.glassLine : dark ? c.line : "#E6EBF3",
    ...(glass ? null : elevated ? shadows.s2 : shadows.s1),
    ...(Platform.OS === "android" && !glass && !tinted ? { elevation: 1 } : null),
  };
  const styles = [s.card, base, padded && s.padded, style];
  if (onPress) {
    return (
      <PressableScale onPress={onPress} scale={0.985} style={styles} {...rest}>
        {sheen}
        {children}
      </PressableScale>
    );
  }
  return (
    <View style={styles} {...rest}>
      {sheen}
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  padded: { padding: 16 },
  sheen: { position: "absolute", top: 0, left: 0, right: 0, height: 36 },
});
