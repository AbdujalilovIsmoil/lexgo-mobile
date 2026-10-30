import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAiTheme } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { useInstructorTarget } from "@/shared/instructor";

type Props = { onClose: () => void; onNew: () => void; onHistory: () => void; remaining?: number | null };

// [ ✕ exit ]  [⚡] LexGo.AI · Onlayn  [ history ] [ new chat ] — round outlined buttons, a hairline under the row.
export function ChatHeader({ onClose, onNew, onHistory, remaining }: Props) {
  const { t } = useT();
  const insets = useInsets();
  const aiTheme = useAiTheme();
  const quota = remaining != null && remaining >= 0;
  const history = useInstructorTarget("ai-chat:history", { label: t("ai.history"), type: "button" });
  const fresh = useInstructorTarget("ai-chat:new", { label: t("ai.newChat"), type: "button" });
  const round = (icon: IconName, label: string, onPress: () => void) => (
    <PressableScale onPress={onPress} hitSlop={6} accessibilityRole="button" accessibilityLabel={label} style={[s.btn, { borderColor: aiTheme.border, backgroundColor: aiTheme.glass }]}>
      <Icon name={icon} size={19} color={aiTheme.text} />
    </PressableScale>
  );
  return (
    <View style={[s.bar, { paddingTop: insets.top + 8, borderBottomColor: aiTheme.border }]}>
      {round("x", t("ai.close"), onClose)}
      <View style={s.mid}>
        <LinearGradient colors={["#2F6BFF", "#3FA9E8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.badge}>
          <Icon name="zap" size={18} tone="white" />
        </LinearGradient>
        <View style={s.col}>
          <Text variant="h4" style={{ color: aiTheme.text, fontSize: 18 }}>{t("ai.title")}</Text>
          {quota ? (
            <Text variant="caption" numberOfLines={1} style={{ color: aiTheme.muted }}>{t("ai.remaining", { n: remaining })}</Text>
          ) : (
            <View style={s.online}>
              <View style={s.dot} />
              <Text variant="caption" weight="semibold" style={s.onlineTx}>{t("ai.status")}</Text>
            </View>
          )}
        </View>
      </View>
      <View {...history}>{round("clock", t("ai.history"), onHistory)}</View>
      <View {...fresh}>{round("edit-2", t("ai.newChat"), onNew)}</View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  btn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  mid: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 6 },
  badge: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 1 },
  online: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ADE80" },
  onlineTx: { color: "#4ADE80" },
});
