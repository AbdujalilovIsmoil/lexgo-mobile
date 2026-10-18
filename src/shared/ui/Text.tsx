import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from "react-native";
import { typography, useColors, type TextVariant } from "@/shared/theme";

export type TextTone = "ink" | "gray" | "gray2" | "accent" | "white" | "ok" | "err" | "warn";

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  center?: boolean;
  weight?: "regular" | "medium" | "semibold" | "bold";
};

const weightFamily = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

// Big headings are announced as headings; the system font size is honoured, but only up to 1.3× so layouts hold.
export function Text({ variant = "body", tone = "ink", center, weight, style, ...rest }: TextProps) {
  const colors = useColors();
  const color =
    tone === "white" ? "#FFFFFF" : tone === "accent" ? colors.accent : tone === "ok" ? colors.ok : tone === "err" ? colors.err : tone === "warn" ? colors.warn : colors[tone];
  const base: TextStyle = { ...typography[variant], color };
  if (weight) base.fontFamily = weightFamily[weight];
  if (center) base.textAlign = "center";
  return <RNText maxFontSizeMultiplier={1.3} accessibilityRole={/^h[2-4]$/.test(variant) ? "header" : undefined} {...rest} style={[base, style]} />;
}
