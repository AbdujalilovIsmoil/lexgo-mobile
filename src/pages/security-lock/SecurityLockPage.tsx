import { RefreshControl, ScrollView } from "react-native";
import { LockTimeoutCard, LockToggleCard } from "@/widgets/auth-lock";
import { useLockSettings } from "@/features/auth-lock";
import { AdminPage } from "@/shared/ui/admin";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { useBioInfo } from "@/entities/auth-lock";

// /settings/security-lock — lock the app with Face ID / fingerprint (device passcode as the fallback).
export default function SecurityLockPage() {
  const { t } = useT();
  const insets = useInsets();
  const s = useLockSettings();
  const info = useBioInfo();
  return (
    <AdminPage title={t("au5.title")}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24, gap: 14 }}
        refreshControl={<RefreshControl refreshing={info.isRefetching} onRefresh={() => void info.refetch()} />}
        showsVerticalScrollIndicator={false}
      >
        <LockToggleCard s={s} />
        {s.enabled ? <LockTimeoutCard value={s.timeoutMin} onChange={s.setTimeoutMin} /> : null}
      </ScrollView>
    </AdminPage>
  );
}
