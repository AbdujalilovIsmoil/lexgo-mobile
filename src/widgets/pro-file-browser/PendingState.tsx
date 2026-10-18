import { useRouter } from "expo-router";
import { useT } from "@/shared/i18n";
import { EmptyState } from "@/shared/ui";

// Shown while the server answers 403: storage opens only after the administrator approves the profile.
export function PendingState() {
  const { t } = useT();
  const router = useRouter();
  return <EmptyState icon="lock" title={t("aw8.pendingTitle")} text={t("aw8.pendingText")} actionLabel={t("aw8.pendingCta")} onAction={() => router.push("/pro/onboarding" as never)} />;
}
