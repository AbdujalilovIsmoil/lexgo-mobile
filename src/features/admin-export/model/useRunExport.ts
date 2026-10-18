import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { runExport, type ExportDef, type ExportQuery } from "@/entities/admin-export";

// Download the workbook and open the share sheet; a 403 / failed download reads as a toast, never a crash.
export function useRunExport(onDone?: () => void) {
  const { t } = useT();
  return useMutation({
    mutationFn: ({ def, q }: { def: ExportDef; q: ExportQuery }) => runExport(def, q),
    onSuccess: () => {
      successHaptic();
      onDone?.();
    },
    onError: (e) => {
      errorHaptic();
      toast(e instanceof ApiError && e.detail ? e.detail : t("ag2.failed"), "err");
    },
  });
}
