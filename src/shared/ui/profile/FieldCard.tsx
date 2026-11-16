import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/shared/theme";

// Soft inner box: groups form fields in a sheet, or frames a row inside a profile section (Adliya: a neutral light grey with a hairline).
export function FieldCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors: c, dark, glass } = useTheme();
  return <View style={[{ backgroundColor: dark || glass ? c.surface2 : "#F6F8FB", borderWidth: 1, borderColor: dark || glass ? "transparent" : "#E9EEF5", borderRadius: 14, padding: 12, gap: 12 }, style]}>{children}</View>;
}
