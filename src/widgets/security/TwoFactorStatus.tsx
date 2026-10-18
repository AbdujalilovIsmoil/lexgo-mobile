import type { TwoFactorMethod } from "@/entities/security";
import { useT } from "@/shared/i18n";
import { StatusBox } from "./StatusBox";

// Current 2FA state: the method and what it means, or "not enabled".
export function TwoFactorStatus({ enabled, method }: { enabled: boolean; method: TwoFactorMethod }) {
  const { t } = useT();
  const name = method === "totp" ? "mTotp" : method === "sms" ? "mSms" : "mTelegram";
  return (
    <StatusBox
      ok={enabled}
      icon={enabled ? "shield" : "shield-off"}
      title={enabled ? t(`admSec.${name}`) : t("admSec.off")}
      text={enabled ? t(method === "totp" ? "admSec.mTotpText" : "admSec.mTelegramText") : t("admSec.offText")}
      badge={enabled ? t("admSec.on") : undefined}
    />
  );
}
