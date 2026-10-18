import { StyleSheet, View } from "react-native";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";

// A calm callout under an answer: a tinted well, a round icon tile and the text. "warn" is the missing-source
// warning (ink text on the amber tint), "info" the permanent disclaimer (quiet grey).
export function NoticeCard({ tone, icon, text }: { tone: "warn" | "info"; icon: IconName; text: string }) {
  const c = useColors();
  const warn = tone === "warn";
  return (
    <View accessibilityRole={warn ? "alert" : "text"} style={[s.box, { backgroundColor: warn ? c.warnBg : c.surface2 }]}>
      <View style={[s.tile, { backgroundColor: c.surface }]}><Icon name={icon} size={16} color={warn ? c.warn : c.gray} /></View>
      <Text variant="caption" tone={warn ? "ink" : "gray"} style={s.text}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, borderRadius: 16 },
  tile: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, paddingTop: 1, lineHeight: 18 },
});
