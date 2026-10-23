import { StyleSheet, View } from "react-native";
import { useEffect } from "react";
import { useColors } from "@/shared/theme";
import { useSessionStore } from "@/entities/session";
import { LoginForm } from "@/features/auth";
import { AuthHero } from "@/widgets/auth-hero";
import { Text, HeroScroll, TabletColumn } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export function LoginPage() {
  const c = useColors();
  const { t } = useT();
  const { notice, clearNotice } = useSessionStore();
  useEffect(() => () => clearNotice(), [clearNotice]);
  return (
    <View style={[s.fill, { backgroundColor: c.canvas }]}>
      <HeroScroll keyboardShouldPersistTaps="handled" contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <AuthHero title={t("auth.loginTitle")} subtitle={t("auth.loginSub")} />
        <TabletColumn max={520}>
        <View style={s.body}>
          {notice === "sessionExpired" ? (
            <Text variant="small" tone="warn" center>
              {t("auth.sessionExpired")}
            </Text>
          ) : null}
          <LoginForm />
        </View>
        </TabletColumn>
      </HeroScroll>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingBottom: 40 },
  body: { paddingHorizontal: 16, paddingTop: 24, gap: 12 },
});
