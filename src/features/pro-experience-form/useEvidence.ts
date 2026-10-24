import { useState } from "react";
import { uploadEvidence, type ExpEvidence } from "@/entities/pro-experience";
import { pickDocuments, pickImages } from "@/shared/lib/upload";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";

const MAX_MB = 20;
const EXTS = /\.(pdf|jpe?g|png|webp|docx?)$/i;
export type EvidenceRow = { key: string; name: string; busy: boolean; file: ExpEvidence | null };
let seq = 0;

// Supporting files of an experience entry (PDF, images, DOC/DOCX up to 20 MB), uploaded at once; the submission sends their ids.
export function useEvidence(kept: ExpEvidence[]) {
  const { t } = useT();
  const [rows, setRows] = useState<EvidenceRow[]>(() => kept.map((f) => ({ key: `e${++seq}`, name: f.fileName || f.id, busy: false, file: f })));
  const pick = async (photo: boolean) => {
    const res = photo ? await pickImages({ maxMb: MAX_MB, multiple: true }) : await pickDocuments({ maxMb: MAX_MB, exts: EXTS, multiple: true });
    if (!res) return;
    if (res.error) return toast(t("mf.exp.fileWrong"), "err");
    for (const f of res.files.slice(0, 10)) {
      const key = `e${++seq}`;
      setRows((cur) => [...cur, { key, name: f.name, busy: true, file: null }]);
      uploadEvidence(f)
        .then((e) => setRows((cur) => cur.map((x) => (x.key === key ? { ...x, busy: false, file: e } : x))))
        .catch(() => {
          setRows((cur) => cur.filter((x) => x.key !== key));
          toast(t("mf.exp.fileFailed"), "err");
        });
    }
  };
  return { rows, pick, remove: (key: string) => setRows((c) => c.filter((x) => x.key !== key)), busy: rows.some((r) => r.busy), ids: rows.flatMap((r) => (r.file ? [r.file.id] : [])) };
}
