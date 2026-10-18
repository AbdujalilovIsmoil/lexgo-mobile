import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { radius, shadows, useTheme } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import type { Undo } from "./useTaskMoves";

// Inline snackbar after a move (the global toast has no action button): message + "Undo".
export function UndoBar({ undo, onUndo }: { undo: Undo | null; onUndo: () => void }) {
  const { t } = useT();
  const insets = useInsets();
  const { colors: c, dark } = useTheme();
  if (!undo) return null;
  return (
    <Animated.View
      key={undo.id + undo.message}
      entering={FadeInDown.duration(200)}
      exiting={FadeOutDown.duration(160)}
      accessibilityLiveRegion="polite"
      style={[s.bar, { bottom: insets.bottom + 16, backgroundColor: dark ? c.surface2 : "#0B1F45" }, shadows.s2]}
    >
      <Icon name="check-circle" size={18} color="#4ADE9F" />
      <View style={s.text}><Text variant="small" tone="white" numberOfLines={2}>{undo.message}</Text></View>
      <PressableScale onPress={onUndo} haptic={false} accessibilityLabel={t("aw7.undo")} style={s.btn}>
        <Text variant="small" weight="bold" style={{ color: "#93C6FF" }}>{t("aw7.undo")}</Text>
      </PressableScale>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  bar: { position: "absolute", left: 16, right: 16, flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 16, paddingRight: 6, borderRadius: radius.r },
  text: { flex: 1, paddingVertical: 12 },
  btn: { minHeight: 44, minWidth: 44, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
});
