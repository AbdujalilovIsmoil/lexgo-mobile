import { View } from "react-native";
import { PREF_KEYS, usePrefs, useSavePref, type PrefKey } from "@/entities/notification";
import { useSession } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { ErrorView, Skeleton, Text } from "@/shared/ui";
import { SectionCard, SwitchField } from "@/shared/ui/admin";

const CHANNELS = PREF_KEYS.slice(0, 4);
const TOPICS = PREF_KEYS.slice(4);

// GET/PUT /notifications/preferences: which channels reach the user and which topics are on. In-app
// delivery is always on, so it has no switch. Each switch saves at once (queued while offline).
export function ServerPrefs() {
  const { t } = useT();
  const q = usePrefs();
  const save = useSavePref();
  const tgLinked = useSession()?.user.telegramLinked;
  const group = (title: string, kind: "chan" | "topic", keys: readonly PrefKey[]) => (
    <View style={{ gap: 14 }}>
      <Text variant="kicker" tone="gray2">{title}</Text>
      {keys.map((k) => (
        <SwitchField
          key={k}
          label={t(`nt2.${kind}.${k}`)}
          hint={k === "telegram" && tgLinked === false ? t("nt2.tgHint") : k === "sms" ? t("nt2.smsHint") : undefined}
          value={q.data?.[k] ?? false}
          onChange={(value) => save.mutate({ key: k, value })}
        />
      ))}
    </View>
  );
  return (
    <SectionCard title={t("nt2.serverTitle")}>
      {q.isLoading ? (
        <View style={{ gap: 14 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={40} round={12} />)}</View>
      ) : q.isError && !q.data ? (
        <ErrorView error={q.error} onRetry={() => void q.refetch()} compact />
      ) : (
        <>
          {group(t("nt2.channels"), "chan", CHANNELS)}
          {group(t("nt2.topics"), "topic", TOPICS)}
          <Text variant="caption" tone="gray2">{t("nt2.inAppAlways")}</Text>
        </>
      )}
    </SectionCard>
  );
}
