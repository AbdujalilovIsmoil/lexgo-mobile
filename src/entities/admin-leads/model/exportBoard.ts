import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import { exportBoard } from "../api/exportApi";
import { useLeadScope } from "./scope";

// Excel export of the board; a refused export (403 / 5xx) shows the server's words.
export function useExportBoard() {
  const { t } = useT();
  const scope = useLeadScope();
  return useMutation({
    mutationFn: () => exportBoard(scope),
    onError: (e) => toast(e instanceof ApiError && e.detail ? e.detail : t("cc5.exportFailed"), "err"),
  });
}
