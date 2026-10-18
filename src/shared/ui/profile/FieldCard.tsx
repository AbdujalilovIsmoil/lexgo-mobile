import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useColors } from "@/shared/theme";

// Soft inner box: groups form fields in a sheet, or frames a row inside a profile section.
export function FieldCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return <View style={[{ backgroundColor: c.surface2, borderRadius: 18, padding: 12, gap: 12 }, style]}>{children}</View>;
}
