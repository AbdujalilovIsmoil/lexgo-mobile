import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { createLead, deleteLead, updateLead } from "../api/leadApi";
import { patchLead, removeLead } from "./board";
import { assignPatch, withAssignment } from "./assign";
import { leadKeys } from "./queries";
import { useLeadScope } from "./scope";
import type { Lead, LeadDraft } from "./types";
import { useBoardCache } from "./useBoardCache";

export function useCreateLead() {
  const scope = useLeadScope();
  return useAdminMutation({ mutationFn: (d: LeadDraft) => createLead(scope, d), invalidate: [leadKeys.boards], success: "admLeads.created" });
}

export function useDeleteLead() {
  const cache = useBoardCache();
  return useAdminMutation({
    mutationFn: async (id: string) => {
      await deleteLead(id);
      cache.write((cols) => removeLead(cols, id));
    },
    invalidate: [leadKeys.boards],
    success: "adm.deleted",
  });
}

// (Re)assign one lead to an operator ("" = unassign); the card updates at once and rolls back on failure.
export function useAssignLead() {
  const { t } = useT();
  const scope = useLeadScope();
  const cache = useBoardCache();
  return useAdminMutation({
    mutationFn: async ({ lead, userId, by }: { lead: Lead; userId: string; by: string }) => {
      const snap = cache.read();
      const at = new Date().toISOString();
      cache.write((cols) => patchLead(cols, lead.id, (l) => withAssignment(l, userId, by, at)));
      try {
        await updateLead(scope, lead.id, assignPatch(lead, userId, by, at));
      } catch (e) {
        cache.restore(snap);
        throw e;
      }
    },
    invalidate: [leadKeys.timeline],
    onSuccess: (_, v) => toast(t(v.userId ? "admLeads.assignDone" : "admLeads.assignRemoved"), "ok"),
  });
}
