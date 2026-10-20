import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Button, Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { finishStep, openInstructor, type OverlayStep } from "@/features/instructor";

type Props = { step: OverlayStep; above: boolean; offset: number };

// The caption card of a guided step: text, "2 / 4", Stop and Next / Got it, plus a way back to the assistant.
export function OverlayBubble({ step, above, offset }: Props) {
  const c = useColors();
  const { t } = useT();
  const last = step.index >= step.total;
  return (
    <Animated.View entering={above ? FadeInDown.duration(220) : FadeInUp.duration(220)} style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }, above ? { bottom: offset } : { top: offset }]}>
      <Text variant="small">{step.caption}</Text>
      <View style={s.row}>
        {step.total > 1 ? <Text variant="caption" tone="gray2">{t("ax3.step", { i: step.index, n: step.total })}</Text> : null}
        <PressableScale onPress={() => { finishStep("stop"); openInstructor(); }} accessibilityRole="button" accessibilityLabel={t("ax3.reopen")} hitSlop={8}>
          <Icon name="message-circle" size={18} color={c.accent} />
        </PressableScale>
        <View style={s.fill} />
        <Button title={t("ax3.stop")} variant="ghost" size="sm" onPress={() => finishStep("stop")} />
        <Button title={last ? t("ax3.done") : t("ax3.next")} size="sm" onPress={() => finishStep("next")} />
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { position: "absolute", left: 16, right: 16, borderRadius: 20, borderWidth: 1, padding: 14, gap: 10, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  fill: { flex: 1 },
});
