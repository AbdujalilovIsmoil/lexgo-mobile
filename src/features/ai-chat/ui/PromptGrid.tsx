import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useAiTheme } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useInstructorTarget } from "@/shared/instructor";

// Two-column grid of suggested questions (ai.quick): an arrow at the top, the question at the foot of the card; a tap sends it.
export function PromptGrid({ onPick }: { onPick: (text: string) => void }) {
  const { t, tList } = useT();
  const aiTheme = useAiTheme();
  const mark = useInstructorTarget("ai-chat:suggestions", { label: t("ai.welcomeTitle"), type: "list" });
  const items = tList("ai.quick");
  const rows = Array.from({ length: Math.ceil(items.length / 2) }, (_, r) => items.slice(r * 2, r * 2 + 2));
  return (
    <View {...mark} style={s.grid}>
      {rows.map((row, r) => (
        <View key={r} style={s.row}>
          {row.map((q, i) => (
            <Animated.View key={q} entering={FadeInUp.delay(150 + (r * 2 + i) * 60).duration(360)} style={s.cell}>
              <PressableScale onPress={() => onPick(q)} style={[s.card, { borderColor: aiTheme.border, backgroundColor: aiTheme.card }]}>
                <Icon name="arrow-up-right" size={16} color={aiTheme.accent} />
                <Text variant="body" weight="semibold" numberOfLines={3} style={{ color: aiTheme.text }}>{q}</Text>
              </PressableScale>
            </Animated.View>
          ))}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  grid: { gap: 10, alignSelf: "stretch" },
  row: { flexDirection: "row", gap: 10 },
  cell: { flex: 1 },
  card: { flex: 1, minHeight: 92, justifyContent: "space-between", gap: 12, padding: 14, borderRadius: 18, borderWidth: 1 },
});
