import type { AchStatus } from "@/entities/pro-achievements";
import { Pill } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Where an achievement stands: approved, under review, rejected, or a state the app does not know.
export function StatePill({ status }: { status: AchStatus }) {
  const { t } = useT();
  if (status === "approved") return <Pill label={t("ach.status.approved")} tone="ok" small />;
  if (status === "pending_review") return <Pill label={t("ach.status.pending")} tone="warn" small />;
  if (status === "rejected") return <Pill label={t("ach.status.rejected")} tone="err" small />;
  return <Pill label={t("ach.status.other")} tone="gray" small />;
}
