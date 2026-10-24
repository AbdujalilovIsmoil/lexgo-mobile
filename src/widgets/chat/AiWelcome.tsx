import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { aiTheme } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useSession } from "@/entities/session";
import { useAfterInteractions } from "@/shared/lib/useAfterInteractions";
import { AiOrb, PromptGrid } from "@/features/ai-chat";

// Empty-state of the AI screen: the living orb, a greeting and suggestions.
export function AiWelcome({ onPick }: { onPick: (text: string) => void }) {
  const { t } = useT();
  const name = useSession()?.user.name;
  const ready = useAfterInteractions();
  return (
    <View style={s.wrap}>
      <View style={s.orb}>{ready ? <Animated.View entering={FadeIn.duration(500)}><AiOrb size={190} /></Animated.View> : null}</View>
      <Animated.View entering={FadeInUp.delay(150).duration(450)} style={s.copy}>
        {name ? <Text variant="small" center style={{ color: aiTheme.accent }}>{t("cxAi.hi", { name })}</Text> : null}
        <Text variant="h2" center style={{ color: aiTheme.text }}>
          {t("ai.welcomeTitle")}
        </Text>
        <Text variant="small" center style={{ color: aiTheme.muted }}>
          {t("ai.welcomeSub")}
        </Text>
      </Animated.View>
      {ready ? <PromptGrid onPick={onPick} /> : null}
      <Text variant="caption" center style={{ color: aiTheme.muted }}>
        {t("ai.greetingNote")}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", gap: 18, paddingVertical: 8 },
  orb: { width: 190, height: 190 },
  copy: { alignItems: "center", gap: 6, paddingHorizontal: 8 },
});
