import { useDemoStore } from "@/entities/admin-dash";
import { useT } from "@/shared/i18n";
import { EmptyState } from "@/shared/ui";

// Shown when the server has switched the retention module off (every /retention/* route answers 404):
// the screen says so and offers the labelled sample numbers instead of an empty page.
export function RetentionOff() {
  const { t } = useT();
  const setForced = useDemoStore((s) => s.setForced);
  return <EmptyState icon="power" title={t("admRet.off")} text={t("admRet.offText")} actionLabel={t("admRetV.seeDemo")} onAction={() => setForced(true)} />;
}
