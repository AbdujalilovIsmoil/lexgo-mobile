import { useState } from "react";
import { Button, BottomSheet, SheetScroll, confirmDialog } from "@/shared/ui";
import { SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useKept } from "@/shared/lib/useKept";
import { AssignField, EditLeadSheet, LeadActionsRow, NoteReminder } from "@/features/admin-leads";
import { columnTitle, leadTitle, stageOf, useDeleteLead, type Column, type Lead, type Operator, type OpsStatus } from "@/entities/admin-leads";
import { DrawerSection } from "./DrawerSection";
import { LeadInfo } from "./LeadInfo";
import { LeadTimeline } from "./LeadTimeline";

type Props = { lead: Lead | null; cols: Column[]; ops: Operator[]; opsStatus: OpsStatus; meId: string; onMove: (lead: Lead, key: string) => void; onClose: () => void };

// One lead in a bottom sheet: actions, stage, operator, info, notes, history and delete.
export function LeadDrawer({ lead: current, cols, ops, opsStatus, meId, onMove, onClose }: Props) {
  const { t } = useT();
  const lead = useKept(current);
  const del = useDeleteLead();
  const [editing, setEditing] = useState(false);
  const remove = () =>
    lead &&
    confirmDialog({
      title: t("adm.confirmDeleteTitle"), message: t("admLeads.deleteConfirm"), confirmLabel: t("adm.delete"), cancelLabel: t("adm.cancel"), icon: "trash-2", danger: true,
      onConfirm: async () => { await del.mutateAsync(lead.id); onClose(); },
    });
  return (
    <BottomSheet visible={!!current} onClose={onClose} title={lead ? leadTitle(t, lead) : ""} subtitle={lead?.phone || lead?.workId} snaps={[0.62, 0.94]}>
      <SheetScroll>
        {lead ? (
          <>
            <LeadActionsRow lead={lead} onClose={onClose} />
            <DrawerSection title={t("admLeads.stage")}>
              <SelectField value={stageOf(cols, lead.id)} options={cols.map((c) => ({ value: c.key, label: columnTitle(t, c) }))} onChange={(k) => onMove(lead, k)} />
            </DrawerSection>
            <DrawerSection title={t("admLeads.operator")}><AssignField lead={lead} ops={ops} status={opsStatus} meId={meId} /></DrawerSection>
            <DrawerSection title={t("admLeads.info")}>
              <LeadInfo lead={lead} />
              <Button title={t("adm.edit")} icon="edit-2" variant="soft" size="sm" onPress={() => setEditing(true)} />
            </DrawerSection>
            <DrawerSection title={t("admLeads.noteReminder")}><NoteReminder lead={lead} /></DrawerSection>
            <DrawerSection title={t("admLeads.timeline")}><LeadTimeline leadId={lead.id} cols={cols} /></DrawerSection>
            <Button title={t("admLeads.deleteLead")} icon="trash-2" variant="line" loading={del.isPending} onPress={remove} />
          </>
        ) : null}
      </SheetScroll>
      <EditLeadSheet lead={editing ? lead : null} onClose={() => setEditing(false)} />
    </BottomSheet>
  );
}
