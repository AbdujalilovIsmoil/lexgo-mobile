import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { importDocx, importZip, previewTemplate, type ImportMeta, type PickedFile, type Preview } from "@/entities/admin-templates";
import { toast } from "@/shared/ui";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import type { ImportMode } from "./pickImportFile";

export type ImportOutcome = { mode: ImportMode; count: number; preview: Preview | null };

// Upload a DOCX (then fetch the field preview) or a ZIP of many; imports land as inactive drafts.
export function useImportFlow() {
  const { t } = useT();
  const qc = useQueryClient();
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null);
  const run = useMutation({
    mutationFn: async (v: { mode: ImportMode; file: PickedFile; meta: ImportMeta }): Promise<ImportOutcome> => {
      if (v.mode === "zip") return { mode: "zip", count: await importZip(v.file, v.meta), preview: null };
      const tpl = await importDocx(v.file, v.meta);
      return { mode: "docx", count: 1, preview: await previewTemplate({ templateId: tpl.id }).catch(() => null) };
    },
    onSuccess: (o) => {
      successHaptic();
      setOutcome(o);
      toast(o.mode === "zip" ? t("admTplB.zipDone", { n: o.count }) : t("admTplB.docxDone", { n: o.preview?.fields.length ?? 0 }), "ok");
      void qc.invalidateQueries({ queryKey: ["admin-templates"] });
    },
    onError: (e) => {
      errorHaptic();
      const s = e instanceof ApiError ? e.status : 0;
      toast(s === 409 ? t("admTplB.slugTaken") : s === 415 ? t("admTplB.onlyDocx") : s === 413 ? t("admTplB.tooBig") : e instanceof ApiError && e.detail ? e.detail : t("admTplB.importError"), "err");
    },
  });
  return { run, outcome, clear: () => setOutcome(null) };
}
