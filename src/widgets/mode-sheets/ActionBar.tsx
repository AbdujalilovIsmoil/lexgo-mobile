import { StyleSheet, View } from "react-native";
import type { ReactNode } from "react";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";

// Sticky bottom bar of a drawer (hairline on top, safe-area gap below).
export function ActionBar({ children }: { children: ReactNode }) {
  const c = useColors();
  const insets = useInsets();
  return <View style={[s.bar, { backgroundColor: c.surface, borderTopColor: c.line, paddingBottom: insets.bottom + 12 }]}>{children}</View>;
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
});
