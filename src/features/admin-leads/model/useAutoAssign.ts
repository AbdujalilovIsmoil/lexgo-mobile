import { useState } from "react";
import { ApiError } from "@/shared/api";
import { assignPatch, patchLead, updateLead, useBoardCache, useLeadScope, withAssignment, type Assignment } from "@/entities/admin-leads";

export type AutoResult = { done: number; failed: number; forbidden: boolean };

// Saves a distribution plan lead by lead (there is no bulk endpoint). Stops at the first 403
// (the account can't assign at all); the board updates after every saved lead.
export function useAutoAssign() {
  const scope = useLeadScope();
  const cache = useBoardCache();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const run = async (plan: Assignment[], by: string): Promise<AutoResult> => {
    const res: AutoResult = { done: 0, failed: 0, forbidden: false };
    setProgress({ done: 0, total: plan.length });
    for (const { lead, operator } of plan) {
      const at = new Date().toISOString();
      try {
        await updateLead(scope, lead.id, assignPatch(lead, operator.id, by, at));
        cache.write((cols) => patchLead(cols, lead.id, (l) => withAssignment(l, operator.id, by, at)));
        res.done += 1;
        setProgress({ done: res.done, total: plan.length });
      } catch (e) {
        if (e instanceof ApiError && e.status === 403) {
          res.forbidden = true;
          break;
        }
        res.failed += 1;
      }
    }
    setProgress(null);
    return res;
  };
  return { run, progress };
}
