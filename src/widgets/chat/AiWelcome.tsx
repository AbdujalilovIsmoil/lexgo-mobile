import { Platform, StyleSheet, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAiTheme } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useSession } from "@/entities/session";
import { useAfterInteractions } from "@/shared/lib/useAfterInteractions";
import { PromptGrid } from "@/features/ai-chat";

// Empty state of the AI screen: the sparkle mark with its glow, "Salom, {name}", the question and one line — all centred — then the
// suggested questions two by two. The privacy line sits under the input (PiiNote).
export function AiWelcome({ onPick }: { onPick: (text: string) => void }) {
  const { t } = useT();
  const aiTheme = useAiTheme();
  const name = useSession()?.user.name?.split(" ")[0];
  const ready = useAfterInteractions();
  return (
    <View style={s.wrap}>
      <Animated.View entering={FadeInUp.duration(420)} style={s.copy}>
        <LinearGradient colors={["#2F6BFF", "#3FA9E8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.mark}>
          <Ionicons name="sparkles" size={26} color="#FFFFFF" />
        </LinearGradient>
        {name ? <Text variant="body" weight="semibold" center style={{ color: aiTheme.accent, marginTop: 10 }}>{t("cxAi.hi", { name })}</Text> : null}
        <Text variant="h2" center style={[s.title, { color: aiTheme.text }]}>{t("ai.welcomeTitle")}</Text>
        <Text variant="body" center style={{ color: aiTheme.muted }}>{t("ai.welcomeSub")}</Text>
      </Animated.View>
      {ready ? <PromptGrid onPick={onPick} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 20, paddingVertical: 8 },
  copy: { gap: 8, alignItems: "center", paddingHorizontal: 8 },
  mark: {
    width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center",
    ...Platform.select({ ios: { shadowColor: "#2F6BFF", shadowOpacity: 0.55, shadowRadius: 18, shadowOffset: { width: 0, height: 6 } }, default: { elevation: 10 } }),
  },
  title: { fontSize: 32, lineHeight: 37 },
});
