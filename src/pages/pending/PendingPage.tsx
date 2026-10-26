import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/shared/theme";
import { AuthHero } from "@/widgets/auth-hero";
import { PendingSteps } from "@/widgets/auth-gate";
import { useT } from "@/shared/i18n";
import { Button, HeroScroll, Text } from "@/shared/ui";

// A seller sign-up that waits for an admin (the server issued no tokens): what happens next and a way
// back to sign-in. The server's own message is shown when it sent one.
export function PendingPage() {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  const { role, message } = useLocalSearchParams<{ role?: string; message?: string }>();
  const kind = role === "yurist" ? "yurist" : "advokat";
  return (
    <View style={[s.fill, { backgroundColor: c.canvas }]}>
      <HeroScroll contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <AuthHero title={t("auth.pendingTitle")} subtitle={t(`au1.role.${kind}`)} back={false} />
        <View style={s.body}>
          <Text variant="body" center>{message || t("auth.pendingText")}</Text>
          <PendingSteps />
          <Button title={t("au3.toLogin")} onPress={() => router.replace("/auth/login")} variant="gradient" size="lg" full icon="log-in" />
        </View>
      </HeroScroll>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingBottom: 40 },
  body: { paddingHorizontal: 16, paddingTop: 24, gap: 18 },
});
