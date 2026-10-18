import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Text } from "./Text";

// .kick — uppercase label chip above section headings.
export function Kicker({ label, onDark }: { label: string; onDark?: boolean }) {
  const c = useColors();
  return (
    <View style={[s.kick, { backgroundColor: onDark ? "rgba(92,168,255,0.14)" : c.tint2 }]}>
      <Text variant="kicker" style={{ color: onDark ? "#93C6FF" : c.accent, textTransform: "uppercase" }}>
        {label}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  kick: { alignSelf: "flex-start", paddingVertical: 7, paddingHorizontal: 13, borderRadius: radius.pill, marginBottom: 12 },
});
