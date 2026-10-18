import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/shared/ui";

// A titled block inside the lead drawer.
export function DrawerSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="small" weight="bold" tone="gray">{title}</Text>
      {children}
    </View>
  );
}
