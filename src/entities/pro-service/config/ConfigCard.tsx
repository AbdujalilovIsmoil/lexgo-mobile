import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";

type Props = { title: string; right?: ReactNode; children: ReactNode };

// One block of the configuration in the service sheet, in the sheet's glass card look: a bold title (and a pill on the right).
export function ConfigCard({ title, right, children }: Props) {
  const c = useColors();
  return (
    <View style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
      <View style={s.head}>
        <Text variant="body" weight="bold" style={s.flex} accessibilityRole="header">{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: { gap: 10, padding: 16, borderRadius: 20, borderWidth: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 28 },
  flex: { flex: 1 },
});
