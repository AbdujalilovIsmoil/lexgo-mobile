import type { ExpState, ExpStatus } from "@/entities/pro-experience";
import { Pill } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The state of an entry or of one revision; a verified one carries the years the backend counted.
export function StatePill({ state, years }: { state: ExpState | ExpStatus; years?: number | null }) {
  const { t } = useT();
  if (state === "approved") return <Pill label={years != null ? t("mf.exp.status.approvedYears", { n: years }) : t("mf.exp.status.approved")} tone="ok" small />;
  if (state === "pending" || state === "pending_review") return <Pill label={t("mf.exp.status.pending")} tone="warn" small />;
  if (state === "rejected") return <Pill label={t("mf.exp.status.rejected")} tone="err" small />;
  if (state === "cancelled" || state === "superseded") return <Pill label={t(`pxp.state.${state}`)} tone="gray" small />;
  return null;
}
