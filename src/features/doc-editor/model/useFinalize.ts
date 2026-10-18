import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { finalizeDoc, refreshDocs, type FinalizeResult } from "@/entities/doc-queue";
import { serverText } from "../lib/errorText";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
// 409 {code: editor_save_required}: the backend asked the document server to save and it has not landed yet.
const saveRequired = (e: unknown) => e instanceof ApiError && e.status === 409 && e.code === "editor_save_required";

// Send the finished document to the client. While the editor's save has not reached the backend the
// request is retried a few times (2.5 s apart) before the server's message is shown.
export function useFinalize(id: string, onSent: (r: FinalizeResult) => void) {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: async (notes: string) => {
      for (let i = 0; ; i++) {
        try {
          return await finalizeDoc(id, notes);
        } catch (e) {
          if (!saveRequired(e) || i >= 3) throw e;
          await wait(2500);
        }
      }
    },
    onSuccess: (r) => {
      successHaptic();
      toast(t("ad3.sent"), "ok");
      refreshDocs(qc);
      onSent(r);
    },
    onError: (e) => {
      errorHaptic();
      toast(saveRequired(e) ? t("ad3.saveRequired") : serverText(e, t("ad3.finalizeFail")), "err");
    },
  });
}
