import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";

// One titled block of the detail sheet: a quiet well with a small heading.
export function SheetBlock({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  const c = useColors();
  return (
    <View style={[s.box, { backgroundColor: c.surface2 }]}>
      <View style={s.head}>
        <Text variant="small" weight="bold" style={s.flex}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

const s = StyleSheet.create({ box: { gap: 12, padding: 14, borderRadius: radius.r }, head: { flexDirection: "row", alignItems: "center", gap: 8 }, flex: { flex: 1 } });
