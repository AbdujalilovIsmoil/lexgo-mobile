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
import { useTabRole } from "@/widgets/tab-bar/useTabRole";

// Empty state of the AI screen: the sparkle mark with its glow, "Salom, {name}", the question and one line — all centred — then the
// suggested questions two by two. The privacy line sits under the input (PiiNote).
export function AiWelcome({ onPick }: { onPick: (text: string) => void }) {
  const { t } = useT();
  const aiTheme = useAiTheme();
  const session = useSession();
  const name = session?.user.name?.split(" ")[0];
  // A professional (advokat / yurist) gets the app-guide copy and their own questions; a tap sends the question to the chat, as for a client.
  const pro = useTabRole() === "seller";
  const ready = useAfterInteractions();
  return (
    <View style={s.wrap}>
      <Animated.View entering={FadeInUp.duration(420)} style={s.copy}>
        {pro ? null : (
          <LinearGradient colors={["#3B6CF0", "#3FA9E8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.mark}>
            <Ionicons name="sparkles" size={26} color="#FFFFFF" />
          </LinearGradient>
        )}
        {name && !pro ? <Text variant="body" weight="semibold" center style={{ color: aiTheme.accent, marginTop: 10 }}>{t("cxAi.hi", { name })}</Text> : null}
        <Text variant="h2" center style={[s.title, { color: aiTheme.text }]}>{t(pro ? "ai.proTitle" : "ai.welcomeTitle")}</Text>
        <Text variant="body" center style={{ color: aiTheme.muted }}>{t(pro ? "ai.proSub" : "ai.welcomeSub")}</Text>
      </Animated.View>
      {ready && pro ? <Text variant="small" weight="bold" style={{ color: aiTheme.muted, marginBottom: -8, marginLeft: 4 }}>{t("ai.proExamples")}</Text> : null}
      {ready ? <PromptGrid onPick={onPick} pro={pro} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 20, paddingVertical: 8 },
  copy: { gap: 8, alignItems: "center", paddingHorizontal: 8 },
  mark: {
    width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center",
    ...Platform.select({ ios: { shadowColor: "#3B6CF0", shadowOpacity: 0.55, shadowRadius: 18, shadowOffset: { width: 0, height: 6 } }, default: { elevation: 10 } }),
  },
  title: { fontSize: 32, lineHeight: 37 },
});
