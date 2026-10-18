import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { assignGroup, claim } from "../api/ccApi";
import { createUrgent } from "../api/clientApi";
import { urgentKeys } from "./keys";
import { assignRefusal, isConflict } from "./refusal";

// These three explain their expected refusals themselves (gate sheet, closed rating window, override
// offer), so only the unexpected failures become a toast — and only the caller decides which are expected.
function useWrite<V, R>(fn: (v: V) => Promise<R>, ok: string, quiet: (e: unknown) => boolean) {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      successHaptic();
      if (ok) toast(t(ok), "ok");
    },
    onError: (e) => {
      errorHaptic();
      if (!quiet(e)) toast(e instanceof ApiError && e.detail ? e.detail : t("adm.actionFailed"), "err");
    },
    // A refused write (409 race, closed window …) usually means the record moved: refresh either way.
    onSettled: () => void qc.invalidateQueries({ queryKey: urgentKeys.all }),
  });
}

export const useCreateUrgent = (quiet: (e: unknown) => boolean) => useWrite(createUrgent, "", quiet);
export const useAssignGroup = () => useWrite(assignGroup, "", (e) => assignRefusal(e) !== null);
// Claiming is a race: a 409 means somebody else got there first, and the caller says so in its own words.
export const useClaim = (onTaken: () => void) => useWrite(claim, "ug10.claimed", (e) => { const taken = isConflict(e); if (taken) onTaken(); return taken; });
