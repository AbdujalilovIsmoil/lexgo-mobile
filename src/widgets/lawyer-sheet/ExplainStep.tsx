import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, Text, type IconName } from "@/shared/ui";

// One factor of the price: icon, title and one or more lines.
export function ExplainStep({ icon, title, lines }: { icon: IconName; title: string; lines: string[] }) {
  const c = useColors();
  return (
    <View style={s.row}>
      <View style={[s.ic, { backgroundColor: c.tint2 }]}><Icon name={icon} size={17} color={c.accent} /></View>
      <View style={s.txt}>
        <Text variant="body" weight="bold">{title}</Text>
        {lines.map((l) => <Text key={l} variant="small" tone="gray">{l}</Text>)}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  ic: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  txt: { flex: 1, gap: 2 },
});
