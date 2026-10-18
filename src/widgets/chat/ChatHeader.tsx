import { StyleSheet, View } from "react-native";
import { aiTheme } from "@/shared/theme";
import { GradientBox, Icon, IconButton, Text } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { useInstructorTarget } from "@/shared/instructor";

type Props = { onClose: () => void; onNew: () => void; onHistory: () => void; remaining?: number | null };

// [ ✕ exit ]  LexGo.AI · status  [ history ] [ new chat ] — all round glass buttons.
export function ChatHeader({ onClose, onNew, onHistory, remaining }: Props) {
  const { t } = useT();
  const insets = useInsets();
  const quota = remaining != null && remaining >= 0;
  const history = useInstructorTarget("ai-chat:history", { label: t("ai.history"), type: "button" });
  const fresh = useInstructorTarget("ai-chat:new", { label: t("ai.newChat"), type: "button" });
  return (
    <View style={[s.bar, { paddingTop: insets.top + 8 }]}>
      <IconButton icon="x" size={42} tone="glass" onPress={onClose} label={t("ai.close")} />
      <View style={s.mid}>
        <GradientBox round={14} style={s.badge}>
          <Icon name="zap" size={14} tone="white" />
        </GradientBox>
        <View style={s.col}>
          <Text variant="h4" style={{ color: aiTheme.text }}>
            {t("ai.title")}
          </Text>
          <Text variant="caption" numberOfLines={1} style={{ color: quota ? aiTheme.muted : "#4ADE9F" }}>
            {quota ? t("ai.remaining", { n: remaining }) : `● ${t("ai.status")}`}
          </Text>
        </View>
      </View>
      <View {...history}><IconButton icon="clock" size={42} tone="glass" onPress={onHistory} label={t("ai.history")} /></View>
      <View {...fresh}><IconButton icon="edit-3" size={42} tone="glass" onPress={onNew} label={t("ai.newChat")} /></View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingBottom: 10 },
  mid: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 4 },
  badge: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 1 },
});
