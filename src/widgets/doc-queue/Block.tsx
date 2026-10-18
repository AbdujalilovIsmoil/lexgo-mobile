import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";

// One titled block of the detail sheet: a quiet well with a small heading.
export function Block({ title, children }: { title: string; children: ReactNode }) {
  const c = useColors();
  return (
    <View style={[s.box, { backgroundColor: c.surface2 }]}>
      <Text variant="small" weight="bold">{title}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({ box: { gap: 12, padding: 14, borderRadius: radius.r } });
