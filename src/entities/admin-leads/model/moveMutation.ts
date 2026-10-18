import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { moveLead, updateLead } from "../api/leadApi";
import { plainDetails } from "./assign";
import { moveLeadTo } from "./board";
import { leadKeys } from "./queries";
import { useLeadScope } from "./scope";
import type { Lead } from "./types";
import { useBoardCache } from "./useBoardCache";

type Vars = { lead: Lead; columnKey: string; position?: number; lost?: { reason: string; note: string } };

// Optimistic move: the card jumps at once, a rejected call puts it back. Entering a "lost"
// column first writes the lost reason into the lead's details (best effort, like the web).
export function useMoveLead() {
  const scope = useLeadScope();
  const cache = useBoardCache();
  return useAdminMutation({
    mutationFn: async ({ lead, columnKey, position = 0, lost }: Vars) => {
      const snap = cache.read();
      cache.write((cols) => moveLeadTo(cols, lead.id, columnKey, position));
      try {
        if (lost) await updateLead(scope, lead.id, { details: { ...plainDetails(lead.details), lost_reason: lost.reason, lost_note: lost.note, lost_at: new Date().toISOString() } }).catch(() => undefined);
        await moveLead(scope, lead.id, columnKey, position);
      } catch (e) {
        cache.restore(snap);
        throw e;
      }
    },
    invalidate: [leadKeys.boards, leadKeys.timeline],
  });
}
