import { StyleSheet, View } from "react-native";
import { Icon, Text, type IconName } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";

// One labelled fact of the work sheet: a small icon and caps label over the value (or any node, e.g. the advocate).
export function WorkFact({ icon, label, children }: { icon: IconName; label: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={[s.box, { backgroundColor: c.surface2 }]}>
      <View style={s.head}><Icon name={icon} size={13} color={c.gray} /><Text variant="caption" tone="gray" weight="bold" style={s.cap}>{label}</Text></View>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  box: { flexBasis: "47%", flexGrow: 1, gap: 6, padding: 12, borderRadius: radius.r },
  head: { flexDirection: "row", alignItems: "center", gap: 6 },
  cap: { textTransform: "uppercase", letterSpacing: 1, fontSize: 10 },
});
