import { type ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradient, radius } from "@/shared/theme";

type Props = { children: ReactNode; variant?: "primary" | "dark"; style?: StyleProp<ViewStyle>; round?: number };

// --grad / --grad-dark surfaces (hero, AI badge, CTA cards).
export function GradientBox({ children, variant = "primary", style, round = radius.rl }: Props) {
  const colors = variant === "dark" ? gradient.dark : gradient.primary;
  const stops = variant === "dark" ? gradient.darkStops : gradient.primaryStops;
  return (
    <LinearGradient colors={[...colors]} locations={[...stops]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.box, { borderRadius: round }, style]}>
      {children}
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  box: { overflow: "hidden" },
});
