import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { SpecialistInvite } from "@/features/auth";
import { radius, useColors } from "@/shared/theme";
import { Button, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// What a visitor sees where a signed-in client has their active requests and referral progress: one card that says what the account
// holds and offers sign in, sign up, and the specialist way in.
export function DashGuest() {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  return (
    <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }]}>
      <View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name="user" size={24} color={c.accent} /></View>
      <Text variant="h4" center>{t("au1.guestTitle")}</Text>
      <Text variant="small" tone="gray" center>{t("au1.guestSub")}</Text>
      <View style={s.actions}>
        <Button title={t("guest.login")} icon="log-in" variant="gradient" full onPress={() => router.push("/auth/login")} />
        <Button title={t("guest.register")} icon="user-plus" variant="soft" full onPress={() => router.push("/auth/register")} />
      </View>
      <SpecialistInvite />
    </View>
  );
}

const s = StyleSheet.create({
  card: { alignItems: "center", gap: 10, padding: 18, marginHorizontal: 16, marginTop: 16, borderRadius: radius.rl, borderWidth: 1 },
  ico: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  actions: { alignSelf: "stretch", gap: 10, marginTop: 6 },
});
