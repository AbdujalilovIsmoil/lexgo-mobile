import { ActionList, OptionSheet } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { AutoAssignSheet, CreateLeadSheet, LostSheet } from "@/features/admin-leads";
import { columnTitle, isLostKey, stageOf, useExportBoard, type Lead } from "@/entities/admin-leads";
import { ColumnManagerSheet } from "../ColumnManagerSheet";
import { LeadDrawer } from "../LeadDrawer";
import { LeadFilterSheet } from "../LeadFilterSheet";
import type { LeadsPage } from "./useLeadsPage";

// Every sheet of the pipeline screen, driven by the page state.
export function LeadsSheets({ p }: { p: LeadsPage }) {
  const { t } = useT();
  const exporter = useExportBoard();
  const close = () => p.setSheet("");
  const unassigned = p.all.filter((l) => !l.assignedTo).length;
  const fromDrawer = (lead: Lead, key: string) => {
    if (isLostKey(key)) p.setSelId("");
    p.flow.go(lead, key);
  };
  return (
    <>
      <LeadDrawer lead={p.selected} cols={p.cols} ops={p.ops} opsStatus={p.opsStatus} meId={p.meId} onMove={fromDrawer} onClose={() => p.setSelId("")} />
      <LeadFilterSheet visible={p.sheet === "filter"} onClose={close} value={p.filter} onApply={p.setFilter} leads={p.all} ops={p.ops} />
      <CreateLeadSheet visible={p.sheet === "create"} onClose={close} ops={p.ops} />
      <AutoAssignSheet visible={p.sheet === "auto"} onClose={close} leads={p.all} ops={p.ops} status={p.opsStatus} meId={p.meId} />
      <ColumnManagerSheet visible={p.sheet === "cols"} onClose={close} cols={p.cols} />
      <ActionList
        visible={p.sheet === "more"}
        onClose={close}
        title={t("admLeads.more")}
        actions={[
          { key: "export", label: t("cc5.export"), icon: "download", onPress: () => exporter.mutate() },
          { key: "auto", label: `${t("admLeadsC.autoBtn")}${unassigned ? ` · ${unassigned}` : ""}`, icon: "zap", onPress: () => p.setSheet("auto") },
          { key: "cols", label: t("admLeadsC.manageStatuses"), icon: "layers", onPress: () => p.setSheet("cols") },
          { key: "refresh", label: t("adm.refresh"), icon: "refresh-cw", onPress: () => void p.query.refetch() },
        ]}
      />
      <OptionSheet visible={!!p.moveFor} onClose={() => p.setMoveFor(null)} title={t("admLeads.moveTo")} options={p.cols.map((c) => ({ value: c.key, label: columnTitle(t, c) }))} value={stageOf(p.cols, p.moveFor?.id ?? "")} onPick={(k) => p.moveFor && p.flow.go(p.moveFor, k)} />
      <LostSheet ask={p.flow.ask} onCancel={p.flow.cancel} onConfirm={p.flow.confirmLost} />
    </>
  );
}
