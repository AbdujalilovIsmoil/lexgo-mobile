import { StyleSheet } from "react-native";
import { CodeSlots, useOtpTimer } from "@/features/auth";
import type { useCodeEnable } from "@/features/security";
import { PressableScale, Text } from "@/shared/ui";
import { ProfileSheet } from "@/shared/ui/profile";
import { mmss } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { useCodeEntry } from "./useCodeEntry";

// Sheet that confirms "enable 2FA" with the 6-digit code from the Telegram bot / SMS.
export function CodeSheet({ flow }: { flow: ReturnType<typeof useCodeEnable> }) {
  const { t } = useT();
  const step = useKept(flow.step); // keeps the content while the sheet slides out
  const [code, setCode] = useCodeEntry(step?.verificationId ?? "");
  const timer = useOtpTimer(step?.expiresAt ?? 0);
  const waiting = timer.known && !timer.expired;
  return (
    <ProfileSheet accent="violet" icon="lock" visible={!!flow.step} onClose={flow.close} title={t("admSec.codeTitle")} subtitle={t("admSec.codeSub")} onSubmit={() => void flow.verify(code)} submitLabel={t("auth.verify")} submitting={flow.busy} disabled={code.length < 6 || timer.expired} snaps={[0.6, 0.92]}>
      <CodeSlots value={code} onChange={setCode} error={!!flow.error} onComplete={(c) => void flow.verify(c)} />
      {flow.error ? (
        <Text variant="small" tone="err" center>{flow.error}</Text>
      ) : timer.known ? (
        <Text variant="small" tone={timer.expired ? "err" : "gray"} center>{timer.expired ? t("auth.expired") : t("auth.expiresIn", { time: mmss(timer.leftMs) })}</Text>
      ) : null}
      <PressableScale haptic={false} disabled={flow.busy || waiting} onPress={() => void flow.start()} style={s.resend} hitSlop={6}>
        <Text variant="small" tone={waiting ? "gray2" : "accent"} weight="semibold" center>{waiting ? t("auth.resendIn", { time: mmss(timer.leftMs) }) : t("auth.resend")}</Text>
      </PressableScale>
    </ProfileSheet>
  );
}

const s = StyleSheet.create({ resend: { alignSelf: "center", paddingVertical: 6 } });
