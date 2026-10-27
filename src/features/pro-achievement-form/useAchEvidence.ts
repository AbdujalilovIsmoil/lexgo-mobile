import { useState } from "react";
import { ApiError } from "@/shared/api/errors";
import { DOC_EXTS, DOC_TYPES, MAX_FILES, MAX_MB, PHOTO_EXTS, evidenceProblem, uploadAchEvidence, type AchEvidence } from "@/entities/pro-achievements";
import type { EvidenceRow } from "@/entities/pro-experience";
import { pickDocuments, pickImages, type Picked } from "@/shared/lib/upload";
import { useT } from "@/shared/i18n";
import { toast, useErrorText } from "@/shared/ui";

type Row = EvidenceRow & { saved: AchEvidence | null };
let seq = 0;

// Supporting files of an achievement, uploaded at once (PDF, DOC, DOCX, JPEG, PNG, WebP; 20 MB each, 20 at most); the submission sends
// their ids. A file the phone just picked opens in the viewer from the phone, a saved one from the backend.
export function useAchEvidence() {
  const { t } = useT();
  const errText = useErrorText();
  const [rows, setRows] = useState<Row[]>([]);
  const why = (e: unknown): string => {
    const sign = e instanceof ApiError ? `${e.status} ${e.code ?? ""}` : "";
    return /413|size|large/.test(sign) ? t("ach.ev.tooBig") : /415|type|mime|extension/.test(sign) ? t("ach.ev.badFile") : errText(e);
  };
  const send = (f: Picked) => {
    const key = `a${++seq}`;
    setRows((cur) => [...cur, { key, name: f.name, busy: true, file: { uri: f.uri, name: f.name, mime: f.mime }, saved: null }]);
    uploadAchEvidence(f)
      .then((e) => setRows((cur) => cur.map((x) => (x.key === key ? { ...x, busy: false, saved: { ...e, fileName: e.fileName || f.name } } : x))))
      .catch((e: unknown) => {
        setRows((cur) => cur.filter((x) => x.key !== key));
        toast(t("ach.ev.failed", { name: f.name, text: why(e) }), "err");
      });
  };
  const pick = async (photo: boolean) => {
    const room = MAX_FILES - rows.length;
    if (room <= 0) return toast(t("ach.ev.limit", { n: MAX_FILES }), "err");
    const res = photo ? await pickImages({ maxMb: MAX_MB, exts: PHOTO_EXTS, multiple: true, compatible: true }) : await pickDocuments({ maxMb: MAX_MB, exts: DOC_EXTS, types: DOC_TYPES, multiple: true });
    if (!res) return;
    if (res.error) return toast(t(res.error === "tooBig" ? "ach.ev.tooBig" : photo ? "ach.ev.badPhoto" : "ach.ev.badFile"), "err");
    const bad = res.files.map(evidenceProblem).find(Boolean);
    if (bad) return toast(t(bad === "tooBig" ? "ach.ev.tooBig" : "ach.ev.badFile"), "err");
    if (res.files.length > room) toast(t("ach.ev.limit", { n: MAX_FILES }), "info");
    res.files.slice(0, room).forEach(send);
  };
  return { rows, pick, remove: (key: string) => setRows((c) => c.filter((x) => x.key !== key)), busy: rows.some((r) => r.busy), ids: rows.flatMap((r) => (r.saved ? [r.saved.id] : [])) };
}
