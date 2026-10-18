import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtWait } from "../lib/fmtWait";
import { useLogin } from "../model/useLogin";
import { FormPassword, FormPhone } from "./FormFields";
import { SpecialistInvite } from "./SpecialistInvite";

export function LoginForm() {
  const { t } = useT();
  const router = useRouter();
  const f = useLogin();
  const title = f.wait > 0 ? t("au2.retryIn", { time: fmtWait(f.wait) }) : f.busy ? t("auth.busy") : t("auth.submit");
  return (
    <View style={s.form}>
      <FormPhone control={f.control} name="phone" autoFocus />
      <FormPassword control={f.control} name="password" error={f.error ?? undefined} onSubmit={() => void f.submit()} />
      <PressableScale haptic={false} onPress={() => router.push("/auth/forgot")} style={s.forgot} hitSlop={6}>
        <Text variant="small" tone="accent" weight="semibold">
          {t("auth.forgot")}
        </Text>
      </PressableScale>
      <Button title={title} onPress={() => void f.submit()} loading={f.busy} disabled={f.wait > 0} variant="gradient" size="lg" full icon="log-in" />
      <Text variant="caption" tone="gray2" center style={s.note}>
        {t("auth.note")}
      </Text>
      <View style={s.switch}>
        <Text variant="small" tone="gray">
          {t("auth.noAccount")}
        </Text>
        <PressableScale haptic={false} onPress={() => router.replace("/auth/register")} hitSlop={6}>
          <Text variant="small" tone="accent" weight="bold">
            {t("auth.createAccount")}
          </Text>
        </PressableScale>
      </View>
      <SpecialistInvite />
    </View>
  );
}

const s = StyleSheet.create({
  form: { gap: 14 },
  forgot: { alignSelf: "flex-end", marginTop: -4 },
  note: { marginTop: 4 },
  switch: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 12 },
});
