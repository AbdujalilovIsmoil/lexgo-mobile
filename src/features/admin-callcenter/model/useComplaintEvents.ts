import { useQueryClient } from "@tanstack/react-query";
import { ccKeys } from "@/entities/admin-callcenter";
import { useUserEvents } from "@/shared/realtime";
import { useT } from "@/shared/i18n";
import { tapHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";

// `quality_complaint.created / .updated` (user socket): the complaint queue refreshes at once; with `announce` a new
// complaint also toasts (the operator's app-wide mount) so it is seen on any screen.
export function useComplaintEvents(announce: boolean) {
  const qc = useQueryClient();
  const { t } = useT();
  useUserEvents("quality_complaint.", (e) => {
    void qc.invalidateQueries({ queryKey: ccKeys.complaints });
    if (announce && e.event === "quality_complaint.created") {
      tapHaptic();
      toast(t("cc6.newComplaint"), "info");
    }
  });
}
