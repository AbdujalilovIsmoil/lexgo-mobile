import { useRouter } from "expo-router";
import type { User } from "@/entities/session";
import { Button, Icon, ListRow } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Telegram link and two-step login are required of sellers; both are set up on the account Security screen.
export function SecurityCard({ user }: { user: User }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const mark = (ok: boolean) => <Icon name={ok ? "check-circle" : "alert-circle"} size={18} color={ok ? c.ok : c.warn} />;
  return (
    <SectionCard title={t("sl2.securityTitle")}>
      <ListRow icon="send" iconTone={user.telegramLinked ? "ok" : "warn"} title={t("sl2.telegram")} sub={t(user.telegramLinked ? "sl2.linked" : "sl2.notLinked")} right={mark(!!user.telegramLinked)} chevron={false} />
      <ListRow icon="shield" iconTone={user.twoFactorEnabled ? "ok" : "warn"} title={t("sl2.twoFactor")} sub={t(user.twoFactorEnabled ? "sl2.on" : "sl2.off")} right={mark(user.twoFactorEnabled)} chevron={false} />
      <Button title={t("sl2.openSecurity")} variant="soft" size="sm" icon="lock" onPress={() => router.push("/security")} />
    </SectionCard>
  );
}
