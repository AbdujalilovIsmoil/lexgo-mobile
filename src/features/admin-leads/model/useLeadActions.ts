import { createReminder, leadKeys, logLeadCall, reengageLead, type Lead } from "@/entities/admin-leads";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useT } from "@/shared/i18n";

// Note (re-engage), call log and follow-up reminder of one lead.
export function useLeadActions(lead: Lead) {
  const { t } = useT();
  const who = lead.name || lead.phone;
  const note = useAdminMutation({ mutationFn: (text: string) => reengageLead(lead.id, text), invalidate: [leadKeys.timeline], success: "admLeads.noteAdded" });
  const call = useAdminMutation({ mutationFn: () => logLeadCall({ phone: lead.phone, clientUserId: lead.clientUserId, note: `Lead: ${who}` }), invalidate: [leadKeys.timeline], success: "admLeads.callLogged" });
  const reminder = useAdminMutation({ mutationFn: (date: string) => createReminder(`${t("admLeads.reminderTitle")}: ${who}`, date), success: "admLeads.reminderSet" });
  return { note, call, reminder };
}
