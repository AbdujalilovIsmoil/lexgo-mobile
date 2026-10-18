import { Linking, StyleSheet, View } from "react-native";
import { Button, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtWait } from "../lib/fmtWait";
import type { OtpClock } from "../model/useOtpClock";

type Props = { clock: OtpClock; resending: boolean; canResend: boolean; telegramLink?: string; onResend: () => void };

// "Open the Telegram bot" (where the code arrives) and "resend" with the 60 s cooldown.
export function OtpResendRow({ clock, resending, canResend, telegramLink, onResend }: Props) {
  const { t } = useT();
  const waiting = clock.resendIn > 0;
  return (
    <View style={s.col}>
      {telegramLink && !clock.expired ? <Button title={t("auth.openTelegram")} onPress={() => void Linking.openURL(telegramLink).catch(() => {})} variant="soft" full icon="send" /> : null}
      {canResend ? (
        <PressableScale haptic={false} disabled={resending || waiting} onPress={onResend} style={s.resend} hitSlop={6}>
          <Text variant="small" tone={waiting ? "gray2" : "accent"} weight="semibold" center>
            {resending ? t("auth.sending") : waiting ? t("auth.resendIn", { time: fmtWait(clock.resendIn) }) : t("auth.resend")}
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 6 }, resend: { alignSelf: "center", paddingVertical: 6 } });
