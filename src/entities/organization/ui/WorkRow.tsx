import { RowCard } from "@/shared/ui/admin";
import type { IconName } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { isOverdue } from "../lib/stats";
import type { WorkItem, WorkKind } from "../model/workTypes";
import { OrgStatus } from "./OrgStatus";

export const KIND_ICON: Record<WorkKind, IconName> = { order: "shopping-bag", case: "briefcase", urgent: "zap" };
const KIND_TINT: Record<WorkKind, string> = { order: "#3B82F6", case: "#8B5CF6", urgent: "#F59E0B" };

// One order / case / urgent request: id, who works on it, status, amount and date.
export function WorkRow({ item: w, memberName, onPress }: { item: WorkItem; memberName?: string; onPress?: () => void }) {
  const { t, locale } = useT();
  const late = isOverdue(w);
  const money = w.amount ? `${fmtMoney(w.amount)} ${t("adm.currency")}` : "";
  return (
    <RowCard icon={KIND_ICON[w.kind]} tint={late ? "#EF4444" : KIND_TINT[w.kind]} title={w.title || t("og4.untitled")} subtitle={[w.workId, memberName].filter(Boolean).join(" · ")} meta={[money, late ? t("og2.overdue") : fmtDate(w.updatedAt, locale)].filter(Boolean).join(" · ")} right={<OrgStatus status={w.status} />} onPress={onPress} />
  );
}
