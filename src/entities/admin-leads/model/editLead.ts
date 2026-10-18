import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { updateLead } from "../api/leadApi";
import { plainDetails } from "./assign";
import { patchLead } from "./board";
import { leadKeys } from "./queries";
import { useLeadScope } from "./scope";
import type { Lead, LeadEdit } from "./types";
import { useBoardCache } from "./useBoardCache";

// PATCH body of an edit: top-level classification plus the contact fields merged into the existing details.
export const editPatch = (lead: Lead, e: LeadEdit) => ({
  category: e.category,
  region: e.region,
  urgency: e.urgency,
  details: { ...plainDetails(lead.details), name: e.name, phone: e.phone, note: e.note },
});

// Edit a lead: the card shows the new values at once and rolls back when the server refuses.
export function useEditLead() {
  const { t } = useT();
  const scope = useLeadScope();
  const cache = useBoardCache();
  return useAdminMutation({
    mutationFn: async ({ lead, edit }: { lead: Lead; edit: LeadEdit }) => {
      const snap = cache.read();
      cache.write((cols) => patchLead(cols, lead.id, (l) => ({ ...l, ...edit, details: { ...l.details, name: edit.name, phone: edit.phone, note: edit.note } })));
      try {
        await updateLead(scope, lead.id, editPatch(lead, edit));
      } catch (e) {
        cache.restore(snap);
        throw e;
      }
    },
    invalidate: [leadKeys.boards, leadKeys.timeline],
    onSuccess: () => toast(t("cc5.edited"), "ok"),
  });
}
