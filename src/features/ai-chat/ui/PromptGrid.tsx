import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { aiTheme } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useInstructorTarget } from "@/shared/instructor";

const ICONS: IconName[] = ["alert-triangle", "file-text", "dollar-sign", "users", "briefcase", "credit-card"];

// Two-column grid of suggested questions (ai.quick); a tap sends the question.
export function PromptGrid({ onPick }: { onPick: (text: string) => void }) {
  const { t, tList } = useT();
  const mark = useInstructorTarget("ai-chat:suggestions", { label: t("ai.welcomeTitle"), type: "list" });
  const items = tList("ai.quick");
  const rows = Array.from({ length: Math.ceil(items.length / 2) }, (_, r) => items.slice(r * 2, r * 2 + 2));
  return (
    <View {...mark} style={s.grid}>
      {rows.map((row, r) => (
        <View key={r} style={s.row}>
          {row.map((q, i) => (
            <Animated.View key={q} entering={FadeInUp.delay(300 + (r * 2 + i) * 70).duration(380)} style={s.cell}>
              <PressableScale onPress={() => onPick(q)} style={s.card}>
                <View style={s.icon}>
                  <Icon name={ICONS[(r * 2 + i) % ICONS.length]} size={16} color={aiTheme.accent} />
                </View>
                <Text variant="small" weight="semibold" numberOfLines={3} style={s.text}>
                  {q}
                </Text>
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
  card: { flex: 1, minHeight: 96, gap: 10, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: aiTheme.border, backgroundColor: aiTheme.glass },
  icon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(95,217,255,0.14)" },
  text: { color: aiTheme.text },
});
