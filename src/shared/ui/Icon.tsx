import { Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/shared/theme";
import type { ComponentProps } from "react";

export type IconName = ComponentProps<typeof Feather>["name"];

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  tone?: "ink" | "gray" | "accent" | "white";
};

/** The "go back" icon of each platform: Android's arrow (Material), iOS's chevron. Steppers (previous month etc.) keep the chevron. */
export const backIcon: IconName = Platform.OS === "android" ? "arrow-left" : "chevron-left";

// Feather matches the 24-grid line icons in components/icons.tsx.
export function Icon({ name, size = 20, color, tone = "ink" }: Props) {
  const colors = useColors();
  const resolved = color ?? (tone === "white" ? "#FFFFFF" : tone === "accent" ? colors.accent : tone === "gray" ? colors.gray : colors.ink);
  // Decorative: the label belongs to the button / row around it.
  return <Feather name={name} size={size} color={resolved} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
}
