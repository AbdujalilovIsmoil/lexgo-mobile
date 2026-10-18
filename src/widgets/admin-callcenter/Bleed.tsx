import type { ReactNode } from "react";
import { View } from "react-native";

// A full-width bar (chips) inside a padded list header: cancels the list's 16px side padding.
export function Bleed({ children }: { children: ReactNode }) {
  return <View style={{ marginHorizontal: -16 }}>{children}</View>;
}
