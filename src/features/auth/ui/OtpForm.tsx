import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useOtpVerify } from "../model/useOtpVerify";
import { CodeSlots } from "./CodeSlots";
import { OtpLocked } from "./OtpLocked";
import { OtpResendRow } from "./OtpResendRow";
import { OtpStatus } from "./OtpStatus";
import { PasswordField } from "./PasswordField";

export function OtpForm() {
  const { t } = useT();
  const router = useRouter();
  const o = useOtpVerify();
  const { flow, clock } = o;
  if (!flow) return null;
  const reset = flow.purpose === "reset";
  if (o.totpDead || (flow.totp && clock.expired)) {
    return (
      <View style={s.form}>
        <Text variant="small" tone="err" center>{t("au2.totpDead")}</Text>
        <Button title={t("au2.signInAgain")} onPress={() => router.back()} variant="gradient" size="lg" full icon="log-in" />
      </View>
    );
  }
  if (o.locked) return <OtpLocked left={clock.blockedIn} message={o.error} busy={o.resending} onNewCode={() => void o.resend()} />;
  const off = o.busy || clock.blockedIn > 0;
  return (
    <View style={s.form}>
      <CodeSlots value={o.code} onChange={o.setCode} error={!!o.error} disabled={off} onComplete={reset ? undefined : (c) => void o.verify(c)} />
      <OtpStatus clock={clock} error={o.error} note={o.note} />
      {reset ? <PasswordField value={o.password} onChange={o.setPassword} label={t("auth.newPassword")} hint={t("auth.passwordHint")} newPassword onSubmit={() => void o.verify(o.code)} /> : null}
      <Button title={o.busy ? t("auth.verifying") : t(reset ? "au3.resetSubmit" : "auth.verify")} onPress={() => void o.verify(o.code)} loading={o.busy} disabled={o.code.length < 6 || clock.expired || clock.blockedIn > 0} variant="gradient" size="lg" full icon="check" />
      <OtpResendRow clock={clock} resending={o.resending} canResend={!flow.totp} telegramLink={flow.challenge.telegramBotLink} onResend={() => void o.resend()} />
    </View>
  );
}

const s = StyleSheet.create({ form: { gap: 16 } });
