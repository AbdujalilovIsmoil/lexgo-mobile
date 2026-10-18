import { View } from "react-native";
import { NOTIF_KEYS, useNotifPrefs, useSecurityProfile, useTogglePref, type NotifKey } from "@/entities/security";
import { useSession } from "@/entities/session";
import { ErrorView, Skeleton, Text } from "@/shared/ui";
import { SwitchField } from "@/shared/ui/admin";
import { ProfileSection } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";

const CHANNELS = NOTIF_KEYS.slice(0, 4);
const TOPICS = NOTIF_KEYS.slice(4);

// Notification channels and topics (GET/PUT /notifications/preferences); each switch saves on its own.
export function NotifPrefsCard() {
  const { t } = useT();
  const q = useNotifPrefs();
  const toggle = useTogglePref();
  const session = useSession();
  const tgLinked = useSecurityProfile().data?.telegramLinked ?? session?.user.telegramLinked;
  const group = (title: string, kind: "chan" | "topic", keys: readonly NotifKey[]) => (
    <View style={{ gap: 12 }}>
      <Text variant="kicker" tone="gray2">{title}</Text>
      {keys.map((k) => (
        <SwitchField
          key={k}
          label={t(`admSecB.${kind}.${k}`)}
          hint={k === "telegram" && tgLinked === false ? t("admSecB.tgOffHint") : undefined}
          value={q.data?.[k] ?? false}
          onChange={(value) => toggle.mutate({ key: k, value })}
        />
      ))}
    </View>
  );
  return (
    <ProfileSection accent="amber" icon="bell" title={t("admSecB.prefTitle")}>
      {q.isLoading ? (
        <View style={{ gap: 12 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={40} round={12} />)}</View>
      ) : q.isError ? (
        <ErrorView error={q.error} onRetry={() => void q.refetch()} compact />
      ) : (
        <>
          {group(t("admSecB.prefChannels"), "chan", CHANNELS)}
          {group(t("admSecB.prefTopics"), "topic", TOPICS)}
          <Text variant="caption" tone="gray2">{t("admSecB.prefSms")}</Text>
        </>
      )}
    </ProfileSection>
  );
}
