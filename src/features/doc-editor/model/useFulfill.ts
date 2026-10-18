import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { fulfillFile, refreshDocs, type FinalizeResult } from "@/entities/doc-queue";
import { pickDocx, type Docx } from "../lib/pickDocx";
import { serverText } from "../lib/errorText";

// Pick a finished .docx on the phone (for the sheet's file row).
export function usePickDocx(onPicked: (f: Docx) => void) {
  const { t } = useT();
  return async () => {
    try {
      const f = await pickDocx();
      if (f) onPicked(f);
    } catch (e) {
      toast(e instanceof Error && e.message === "tooBig" ? t("ad3.tooBig") : t("ad3.docxOnly"), "err");
    }
  };
}

// Legacy delivery: upload a finished .docx for a template-backed request (POST …/fulfill-file).
export function useFulfill(id: string, onSent: (r: FinalizeResult) => void) {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: ({ file, notes }: { file: Docx; notes: string }) => fulfillFile(id, file, notes),
    onSuccess: (r) => {
      successHaptic();
      toast(t("ad3.sent"), "ok");
      refreshDocs(qc);
      onSent(r);
    },
    onError: (e) => {
      errorHaptic();
      toast(serverText(e, t("ad3.finalizeFail")), "err");
    },
  });
}
