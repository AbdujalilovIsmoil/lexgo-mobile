import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { SpecialistInvite } from "@/features/auth";

// What a guest can do next: sign in, sign up, or sign up as a legal specialist (lawyer / advocate).
export function GuestActions() {
  const { t } = useT();
  const router = useRouter();
  return (
    <View style={s.col}>
      <Button title={t("guest.login")} onPress={() => router.push("/auth/login")} variant="gradient" size="lg" icon="log-in" full />
      <Button title={t("guest.register")} onPress={() => router.push("/auth/register")} variant="soft" size="lg" icon="user-plus" full />
      <SpecialistInvite />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10, paddingHorizontal: 16 },
});
