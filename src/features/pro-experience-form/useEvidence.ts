import { useState } from "react";
import { ApiError } from "@/shared/api/errors";
import { evidenceFile, uploadEvidence, type EvidenceRow, type ExpEvidence } from "@/entities/pro-experience";
import { pickDocuments, pickImages } from "@/shared/lib/upload";
import { useT } from "@/shared/i18n";
import { toast, useErrorText } from "@/shared/ui";

const MAX_MB = 20;
// §3.4: PDF, JPEG, PNG, WEBP, DOC, DOCX up to 20 MiB. The system picker offers only these types and the name is checked again (a picker
// may ignore the filter); a HEIC photo is handed over as JPEG where the phone can convert it, a GIF is refused before any upload.
const DOC_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const DOC_EXTS = /\.(pdf|jpe?g|png|webp|docx?)$/i;
const PHOTO_EXTS = /\.(jpe?g|png|webp)$/i;

type Row = EvidenceRow & { saved: ExpEvidence | null };
let seq = 0;

// Supporting files of an experience entry, uploaded at once; the submission sends their ids. The entry's earlier files stay (also the ones
// a record lists only by id), and each opens in the viewer — a fresh one from the phone, a saved one from the backend.
export function useEvidence(kept: ExpEvidence[]) {
  const { t } = useT();
  const errText = useErrorText();
  const [rows, setRows] = useState<Row[]>(() => kept.map((f, i) => ({ key: `e${++seq}`, name: f.fileName || t("pxp.ev.file", { n: i + 1 }), file: evidenceFile(f), saved: f })));
  const why = (e: unknown): string => {
    const sign = e instanceof ApiError ? `${e.status} ${e.code ?? ""}` : "";
    return /413|size|large/.test(sign) ? t("pxp.ev.tooBig") : /415|type|mime|extension/.test(sign) ? t("pxp.ev.badFile") : errText(e);
  };
  const pick = async (photo: boolean) => {
    const res = photo ? await pickImages({ maxMb: MAX_MB, exts: PHOTO_EXTS, multiple: true, compatible: true }) : await pickDocuments({ maxMb: MAX_MB, exts: DOC_EXTS, types: DOC_TYPES, multiple: true });
    if (!res) return;
    if (res.error) return toast(t(res.error === "tooBig" ? "pxp.ev.tooBig" : photo ? "pxp.ev.badPhoto" : "pxp.ev.badFile"), "err");
    for (const f of res.files.slice(0, 10)) {
      const key = `e${++seq}`;
      setRows((cur) => [...cur, { key, name: f.name, busy: true, file: { uri: f.uri, name: f.name, mime: f.mime }, saved: null }]);
      uploadEvidence(f)
        .then((e) => setRows((cur) => cur.map((x) => (x.key === key ? { ...x, busy: false, saved: { ...e, fileName: e.fileName || f.name } } : x))))
        .catch((e: unknown) => {
          setRows((cur) => cur.filter((x) => x.key !== key));
          toast(t("pxp.ev.failed", { name: f.name, text: why(e) }), "err");
        });
    }
  };
  return { rows, pick, remove: (key: string) => setRows((c) => c.filter((x) => x.key !== key)), busy: rows.some((r) => r.busy), ids: rows.flatMap((r) => (r.saved ? [r.saved.id] : [])) };
}
