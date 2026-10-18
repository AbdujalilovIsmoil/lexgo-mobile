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

// Feather matches the 24-grid line icons in components/icons.tsx.
export function Icon({ name, size = 20, color, tone = "ink" }: Props) {
  const colors = useColors();
  const resolved = color ?? (tone === "white" ? "#FFFFFF" : tone === "accent" ? colors.accent : tone === "gray" ? colors.gray : colors.ink);
  // Decorative: the label belongs to the button / row around it.
  return <Feather name={name} size={size} color={resolved} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
}
