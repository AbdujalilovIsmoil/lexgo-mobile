import { Image, StyleSheet, View } from "react-native";
import { useUnlock } from "@/features/auth-lock";
import { useLogout } from "@/features/auth";
import { GradientBox, Button, Icon, Text } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

type Unlock = ReturnType<typeof useUnlock>;

// Shown over the whole app until the system prompt passes. Biometrics only open the saved session —
// "sign out" is the way back to the password (the server still decides who may sign in).
export function LockScreen({ unlock }: { unlock: Unlock }) {
  const { t } = useT();
  const insets = useInsets();
  const { run: signOut } = useLogout();
  const why = unlock.status && unlock.status !== "ok" && unlock.status !== "cancel" ? t(`au5.result.${unlock.status}`) : null;
  return (
    <GradientBox variant="dark" round={0} style={[s.fill, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={s.center}>
        <Image source={require("../../../assets/logo-small.png")} style={s.logo} />
        <View style={s.icon}>
          <Icon name="lock" size={30} tone="white" />
        </View>
        <Text variant="h2" tone="white" center>{t("au5.lockedTitle")}</Text>
        <Text variant="small" center style={s.sub}>{t("au5.lockedText")}</Text>
        {why ? <Text variant="small" tone="err" center>{why}</Text> : null}
      </View>
      <View style={s.actions}>
        <Button title={t("au5.unlock")} onPress={() => void unlock.run()} loading={unlock.busy} variant="gradient" size="lg" full icon="unlock" />
        <Button title={t("au5.usePassword")} onPress={() => void signOut()} variant="glass" full icon="log-out" />
      </View>
    </GradientBox>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, paddingHorizontal: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  logo: { width: 64, height: 64, borderRadius: 18, marginBottom: 8 },
  icon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.14)" },
  sub: { color: "#C4DEFF", maxWidth: 300 },
  actions: { gap: 10 },
});
