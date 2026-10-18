import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Text } from "./Text";

type Step = { title: string; text: string };

// Vertical numbered timeline (a dot per step joined by a line).
export function Steps({ steps }: { steps: Step[] }) {
  const c = useColors();
  return (
    <View>
      {steps.map((st, i) => (
        <View key={i} style={s.step}>
          <View style={s.rail}>
            <View style={[s.dot, { backgroundColor: c.accent }]}><Text variant="small" weight="bold" tone="white">{i + 1}</Text></View>
            {i < steps.length - 1 ? <View style={[s.line, { backgroundColor: c.line }]} /> : null}
          </View>
          <View style={s.text}>
            <Text variant="h4">{st.title}</Text>
            <Text variant="small" tone="gray">{st.text}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  step: { flexDirection: "row", gap: 14 },
  rail: { alignItems: "center", width: 30 },
  dot: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  line: { flex: 1, width: 2, marginVertical: 4, borderRadius: 1 },
  text: { flex: 1, gap: 3, paddingBottom: 18 },
});
