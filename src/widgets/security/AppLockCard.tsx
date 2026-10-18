import { useRouter } from "expo-router";
import { useLockStore } from "@/entities/session";
import { ListRow } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// Entry to /settings/security-lock: lock the app with Face ID / fingerprint.
export function AppLockCard() {
  const { t } = useT();
  const router = useRouter();
  const on = useLockStore((s) => s.enabled);
  return (
    <SectionCard title={t("au5.title")}>
      <ListRow icon="lock" iconTone={on ? "ok" : "gray"} title={t("au5.switch")} sub={t(on ? "au6.lockOn" : "au6.lockOff")} onPress={() => router.push("/settings/security-lock")} />
    </SectionCard>
  );
}
