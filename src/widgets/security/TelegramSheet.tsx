import { useOtpTimer } from "@/features/auth";
import type { useTelegramLink } from "@/features/security";
import { Icon, Input, PressableScale, Text } from "@/shared/ui";
import { ProfileSheet } from "@/shared/ui/profile";
import { mmss } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";

// Sheet with the one-time t.me link: open it, share it to another device (never the clipboard), wait for the bot.
export function TelegramSheet({ tg }: { tg: ReturnType<typeof useTelegramLink> }) {
  const { t } = useT();
  const link = useKept(tg.link);
  const timer = useOtpTimer(link?.expiresAt ?? 0);
  const expired = timer.expired;
  const hint = expired ? "tgExpired" : tg.manual ? "tgRelinkHint" : "tgHint";
  return (
    <ProfileSheet
      accent="sky"
      icon="send"
      visible={!!tg.link}
      onClose={tg.close}
      title={t("admSecB.tgSheet")}
      subtitle={t(`admSecB.${hint}`)}
      onSubmit={() => void (expired ? tg.start() : tg.open())}
      submitLabel={t(expired ? "admSecB.tgRegenerate" : "admSecB.tgOpen")}
      submitting={tg.busy}
      secondary={{ label: t(tg.manual ? "admSecB.tgDone" : "adm.cancel"), onPress: tg.close }}
      snaps={[0.55, 0.9]}
    >
      {link && !expired ? (
        <>
          <Input
            label={t("admSecB.tgLinkLabel")}
            value={link.url}
            editable={false}
            selectTextOnFocus
            right={<PressableScale onPress={() => void tg.share()} hitSlop={10} accessibilityLabel={t("adm.share")}><Icon name="share-2" size={18} tone="accent" /></PressableScale>}
          />
          <Text variant="caption" tone="gray">{t("admSecB.tgOtherDevice")}</Text>
          <Text variant="small" weight="semibold">{t("admSecB.tgTimeLeft", { time: mmss(timer.leftMs) })}</Text>
          {tg.waiting ? <Text variant="small" tone="accent">{t("admSecB.tgWaiting")}</Text> : null}
        </>
      ) : null}
    </ProfileSheet>
  );
}
