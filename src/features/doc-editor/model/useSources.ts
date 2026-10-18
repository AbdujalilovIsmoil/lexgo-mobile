import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { docKeys, getSources, selectSource, uploadSource, type SourceOption } from "@/entities/doc-queue";
import { pickDocx } from "../lib/pickDocx";
import { serverText } from "../lib/errorText";

export const useSources = (id: string, enabled = true) => useQuery({ queryKey: docKeys.sources(id), queryFn: () => getSources(id), enabled, staleTime: 0 });

// Choosing / uploading a source makes the backend close the old editor session, so the caller reopens the editor.
export function useSourceFlow(id: string, onChanged: () => void, enabled = true) {
  const q = useSources(id, enabled);
  const qc = useQueryClient();
  const { t } = useT();
  const done = () => {
    successHaptic();
    void qc.invalidateQueries({ queryKey: docKeys.sources(id) });
    onChanged();
  };
  const fail = (e: unknown) => {
    errorHaptic();
    const m = e instanceof Error ? e.message : "";
    toast(m === "tooBig" ? t("ad3.tooBig") : m === "badType" ? t("ad3.docxOnly") : serverText(e, t("ad4.sourceFail")), "err");
  };
  const select = useMutation({ mutationFn: (o: SourceOption) => selectSource(id, o.type, o.attachmentId), onSuccess: done, onError: fail });
  const upload = useMutation({
    mutationFn: async () => {
      const f = await pickDocx();
      if (f) await uploadSource(id, f);
      return !!f;
    },
    onSuccess: (picked) => picked && done(),
    onError: fail,
  });
  return { q, select, upload };
}
