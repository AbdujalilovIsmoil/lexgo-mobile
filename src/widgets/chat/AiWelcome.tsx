import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { aiTheme } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useSession } from "@/entities/session";
import { AiOrb, PromptGrid } from "@/features/ai-chat";

// Empty-state of the AI screen: the living orb, a greeting and suggestions.
export function AiWelcome({ onPick }: { onPick: (text: string) => void }) {
  const { t } = useT();
  const name = useSession()?.user.name;
  return (
    <View style={s.wrap}>
      <Animated.View entering={FadeIn.duration(700)}>
        <AiOrb size={190} />
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(150).duration(450)} style={s.copy}>
        {name ? <Text variant="small" center style={{ color: aiTheme.accent }}>{t("cxAi.hi", { name })}</Text> : null}
        <Text variant="h2" center style={{ color: aiTheme.text }}>
          {t("ai.welcomeTitle")}
        </Text>
        <Text variant="small" center style={{ color: aiTheme.muted }}>
          {t("ai.welcomeSub")}
        </Text>
      </Animated.View>
      <PromptGrid onPick={onPick} />
      <Text variant="caption" center style={{ color: aiTheme.muted }}>
        {t("ai.greetingNote")}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", gap: 18, paddingVertical: 8 },
  copy: { alignItems: "center", gap: 6, paddingHorizontal: 8 },
});
