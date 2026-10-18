import { useMemo, useState } from "react";
import { Skeleton, Text, toast } from "@/shared/ui";
import { FormSheet, KpiGrid, KpiTile } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { autoAssign, type AssignStrategy, type Lead, type Operator, type OpsStatus } from "@/entities/admin-leads";
import { useAutoAssign } from "../model/useAutoAssign";
import { AutoPreview } from "./AutoPreview";

type Props = { visible: boolean; onClose: () => void; leads: Lead[]; ops: Operator[]; status: OpsStatus; meId: string };

// Spreads the unassigned leads over the call-center operators, one saved lead at a time.
export function AutoAssignSheet({ visible, onClose, leads, ops, status, meId }: Props) {
  const { t } = useT();
  const [strategy, setStrategy] = useState<AssignStrategy>("round_robin");
  const { run, progress } = useAutoAssign();
  const plan = useMemo(() => (visible ? autoAssign(leads, ops, strategy) : []), [visible, leads, ops, strategy]);
  const blocked = status === "forbidden" ? t("admLeads.opsForbidden") : status === "error" ? t("adm.actionFailed") : status === "ready" && !ops.length ? t("admLeadsC.autoNoOps") : status === "ready" && !plan.length ? t("admLeadsC.autoNothing") : "";
  const start = async () => {
    const r = await run(plan, meId);
    onClose();
    if (r.forbidden && !r.done) toast(t("admLeads.noPermission"), "err");
    else if (r.failed || r.forbidden) toast(t("admLeadsC.autoPartial", { n: r.done, failed: plan.length - r.done }), "err");
    else toast(t("admLeadsC.autoDone", { n: r.done }), "ok");
  };
  return (
    <FormSheet visible={visible} onClose={() => !progress && onClose()} title={t("admLeadsC.autoTitle")} onSubmit={start} submitLabel={t("admLeadsC.autoConfirm")} submitting={!!progress} disabled={!!blocked || status !== "ready"}>
      <KpiGrid>
        <KpiTile icon="user-x" tint="#F59E0B" label={t("admLeads.unassigned")} value={String(leads.filter((l) => !l.assignedTo).length)} />
        <KpiTile icon="headphones" tint="#22C55E" label={t("admLeads.operators")} value={String(ops.length)} />
      </KpiGrid>
      {status === "loading" ? <Skeleton height={80} round={16} /> : blocked ? <Text variant="small" tone="gray">{blocked}</Text> : <AutoPreview ops={ops} plan={plan} strategy={strategy} onStrategy={setStrategy} progress={progress} />}
    </FormSheet>
  );
}
