import { useRouter } from "expo-router";
import { requiresTwoFactor, useSecurityProfile } from "@/entities/security";
import { useSession } from "@/entities/session";
import { useCodeEnable, useDisableTwoFactor } from "@/features/security";
import { Button, Text } from "@/shared/ui";
import { ProfileSection } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";
import { CodeSheet } from "./CodeSheet";
import { TwoFactorStatus } from "./TwoFactorStatus";

// 2FA management. Roles that must use 2FA never see "disable" — only the explanation and,
// when they are on the Telegram code, a switch to the authenticator app. The authenticator setup is
// a page of its own (/security/totp) so the QR and key can be protected from screen capture.
export function TwoFactorCard() {
  const { t } = useT();
  const router = useRouter();
  const user = useSession()?.user;
  const profile = useSecurityProfile().data;
  const code = useCodeEnable();
  const off = useDisableTwoFactor();
  const enabled = profile?.twoFactorEnabled ?? user?.twoFactorEnabled ?? false;
  const method = profile?.method || (enabled ? "telegram" : "");
  const mandatory = requiresTwoFactor(user);
  const toTotp = () => router.push("/security/totp");
  return (
    <>
      <ProfileSection accent="violet" icon="lock" title={t("admSec.tfaTitle")}>
        <Text variant="small" tone="gray">{t("admSec.tfaDesc")}</Text>
        <TwoFactorStatus enabled={enabled} method={method} />
        {mandatory ? <Text variant="caption" tone="warn">{t(enabled ? "admSec.mandatory" : "admSec.mandatoryEnable")}</Text> : null}
        {!enabled ? (
          <>
            <Button title={t("admSec.enableTotp")} icon="smartphone" variant="gradient" onPress={toTotp} full />
            <Button title={t("admSec.enableCode")} icon="send" variant="line" onPress={() => void code.start()} loading={code.busy} full />
          </>
        ) : mandatory ? (
          method !== "totp" ? <Button title={t("admSec.switchTotp")} icon="smartphone" variant="soft" onPress={toTotp} full /> : null
        ) : (
          <Button title={t("admSec.disable")} icon="shield-off" variant="line" onPress={off.ask} loading={off.busy} full />
        )}
      </ProfileSection>
      <CodeSheet flow={code} />
    </>
  );
}
