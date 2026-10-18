import { FactRows } from "@/shared/ui/admin";
import { fmtDateTime } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { isOverdue } from "../lib/stats";
import { useOrgText } from "../lib/useOrgText";
import type { WorkItem } from "../model/workTypes";
import { OrgStatus } from "./OrgStatus";

// Everything the owner endpoints know about one order / case / urgent request.
export function WorkFacts({ item: w, memberName }: { item: WorkItem; memberName?: string }) {
  const { t, locale } = useT();
  const text = useOrgText();
  const when = (iso: string) => (iso ? fmtDateTime(iso, locale) : "");
  return (
    <FactRows rows={[
      { label: t("og4.kind"), value: t(`og2.kinds.${w.kind}`) },
      { label: t("adm.status"), value: <OrgStatus status={w.status} small={false} /> },
      { label: t("og4.stage"), value: w.stage && w.stage !== w.status ? text.status(w.stage) : "" },
      { label: t("og4.payment"), value: w.paymentStatus ? <OrgStatus status={w.paymentStatus} small={false} /> : "" },
      { label: t("og4.member"), value: memberName },
      { label: t("og4.client"), value: w.clientName },
      { label: t("adm.amount"), value: w.amount ? `${fmtMoney(w.amount)} ${t("adm.currency")}` : "" },
      { label: t("og4.deadline"), value: w.deadlineAt ? `${when(w.deadlineAt)}${isOverdue(w) ? ` · ${t("og2.overdue")}` : ""}` : "" },
      { label: t("adm.created"), value: when(w.createdAt) },
      { label: t("adm.updated"), value: when(w.updatedAt) },
    ]} />
  );
}
