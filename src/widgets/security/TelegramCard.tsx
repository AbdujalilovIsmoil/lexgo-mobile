import { useSecurityProfile } from "@/entities/security";
import { useSession } from "@/entities/session";
import { useTelegramLink } from "@/features/security";
import { Button, Text } from "@/shared/ui";
import { ProfileSection } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";
import { StatusBox } from "./StatusBox";
import { TelegramSheet } from "./TelegramSheet";

// Telegram account link. The linked state comes from /auth/me when the backend exposes it.
export function TelegramCard() {
  const { t } = useT();
  const user = useSession()?.user;
  const linked = useSecurityProfile().data?.telegramLinked ?? user?.telegramLinked;
  const tg = useTelegramLink(linked);
  return (
    <>
      <ProfileSection accent="sky" icon="send" title={t("admSecB.tgTitle")}>
        <Text variant="small" tone="gray">{t("admSecB.tgDesc")}</Text>
        {linked ? <StatusBox ok icon="send" title={t("admSecB.tgLinked")} text={t("admSecB.tgLinkedText")} /> : null}
        {linked === undefined ? <Text variant="caption" tone="gray2">{t("admSecB.tgUnknown")}</Text> : null}
        <Button title={t(linked ? "admSecB.tgRelink" : "admSecB.tgConnect")} icon="send" variant={linked ? "line" : "gradient"} onPress={() => void tg.start()} loading={tg.busy} full />
      </ProfileSection>
      <TelegramSheet tg={tg} />
    </>
  );
}
