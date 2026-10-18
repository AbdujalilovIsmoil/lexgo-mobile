import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { brand, gradient, radius, shadows, useColors } from "@/shared/theme";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";
import { Icon, type IconName } from "./Icon";

export type ButtonVariant = "primary" | "gradient" | "soft" | "line" | "glass" | "ghost";
type Props = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  iconRight?: boolean;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
};

// .btn + modifiers from globals.css (pill shape, 14/24 padding, 600 weight).
export function Button({ title, onPress, variant = "primary", size = "md", icon, iconRight, loading, disabled, full, style }: Props) {
  const c = useColors();
  const pad = size === "sm" ? [10, 17] : size === "lg" ? [17, 32] : [14, 24];
  const fs = size === "sm" ? 14 : size === "lg" ? 16 : 15;
  const bg: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: brand.b600, ...shadows.blue },
    gradient: { backgroundColor: "transparent", ...shadows.blue },
    soft: { backgroundColor: c.tint2 },
    line: { backgroundColor: c.surface },
    glass: { backgroundColor: "rgba(255,255,255,0.14)" },
    ghost: { backgroundColor: "transparent" },
  };
  // The edge of the "line" / "glass" looks is drawn on top (absolute), so it adds nothing to the size: every variant
  // is exactly as tall and wide as the same label in any other, which keeps neighbouring buttons level.
  const edge = variant === "line" ? { w: 1.5, color: c.line } : variant === "glass" ? { w: 1, color: "rgba(255,255,255,0.25)" } : null;
  const fg = variant === "primary" || variant === "gradient" || variant === "glass" ? "#FFFFFF" : variant === "soft" ? c.accentStrong : variant === "ghost" ? c.accent : c.ink;
  const content = (
    <View style={[s.row, { paddingVertical: pad[0], paddingHorizontal: pad[1] }]}>
      {loading ? <ActivityIndicator color={fg} /> : icon && !iconRight ? <Icon name={icon} size={18} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: fs, fontFamily: "Inter_600SemiBold" }}>{title}</Text>
      {!loading && icon && iconRight ? <Icon name={icon} size={18} color={fg} /> : null}
    </View>
  );
  return (
    <PressableScale onPress={onPress} disabled={disabled || loading} accessibilityLabel={title} accessibilityState={{ disabled: !!disabled, busy: !!loading }} style={[s.base, bg[variant], full && s.full, (disabled || loading) && s.disabled, style]}>
      {variant === "gradient" ? (
        <LinearGradient colors={[...gradient.primary]} locations={[...gradient.primaryStops]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.grad}>
          {content}
        </LinearGradient>
      ) : (
        content
      )}
      {edge ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius.pill, borderWidth: edge.w, borderColor: edge.color }]} /> : null}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  base: { borderRadius: radius.pill, overflow: "hidden", alignSelf: "flex-start" },
  grad: { borderRadius: radius.pill },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  full: { alignSelf: "stretch" },
  disabled: { opacity: 0.55 },
});
