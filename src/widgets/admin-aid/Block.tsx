import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/shared/ui";

// A titled group inside a detail sheet.
export function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="kicker" tone="gray">{title}</Text>
      {children}
    </View>
  );
}
