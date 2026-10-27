import { useState } from "react";
import { ApiError } from "@/shared/api/errors";
import { checkEvidence, evidenceFile, EVIDENCE_TYPES, uploadEvidence, type EvidenceRow, type ExpEvidence } from "@/entities/pro-experience";
import { pickDocuments, pickImages } from "@/shared/lib/upload";
import { useT } from "@/shared/i18n";
import { toast, useErrorText } from "@/shared/ui";

// Three names at most, then "+N".
const listed = (names: string[]): string => names.slice(0, 3).join(", ") + (names.length > 3 ? ` +${names.length - 3}` : "");

type Row = EvidenceRow & { saved: ExpEvidence | null };
let seq = 0;

// Supporting files of an experience entry, uploaded at once; the submission sends their ids. The entry's earlier files stay (also the ones
// a record lists only by id), and each opens in the viewer — a fresh one from the phone, a saved one from the backend.
export function useEvidence(kept: ExpEvidence[]) {
  const { t } = useT();
  const errText = useErrorText();
  const [rows, setRows] = useState<Row[]>(() => kept.map((f, i) => ({ key: `e${++seq}`, name: f.fileName || t("pxp.ev.file", { n: i + 1 }), file: evidenceFile(f), saved: f })));
  const why = (e: unknown, name: string): string => {
    const sign = e instanceof ApiError ? `${e.status} ${e.code ?? ""}` : "";
    return /413|size|large/.test(sign) ? t("pxp.ev.tooBig", { names: name }) : /415|type|mime|extension/.test(sign) ? t("pxp.ev.badType", { names: name }) : errText(e);
  };
  // §18 is checked here, not in the picker, so a refused file is named: the picker's own check would drop the whole batch unnamed. A HEIC
  // photo is handed over as JPEG where the phone can convert it; the system file picker is only offered the allowed types.
  const pick = async (photo: boolean) => {
    const res = photo ? await pickImages({ multiple: true, compatible: true }) : await pickDocuments({ types: EVIDENCE_TYPES, multiple: true });
    if (!res) return;
    const { ok, badType, tooBig } = checkEvidence(res.files);
    if (badType.length) toast(t("pxp.ev.badType", { names: listed(badType.map((f) => f.name)) }), "err", 6000);
    if (tooBig.length) toast(t("pxp.ev.tooBig", { names: listed(tooBig.map((f) => f.name)) }), "err", 6000);
    for (const f of ok.slice(0, 10)) {
      const key = `e${++seq}`;
      setRows((cur) => [...cur, { key, name: f.name, busy: true, file: { uri: f.uri, name: f.name, mime: f.mime }, saved: null }]);
      uploadEvidence(f)
        .then((e) => setRows((cur) => cur.map((x) => (x.key === key ? { ...x, busy: false, saved: { ...e, fileName: e.fileName || f.name } } : x))))
        .catch((e: unknown) => {
          setRows((cur) => cur.filter((x) => x.key !== key));
          toast(t("pxp.ev.failed", { name: f.name, text: why(e, f.name) }), "err");
        });
    }
  };
  return { rows, pick, remove: (key: string) => setRows((c) => c.filter((x) => x.key !== key)), busy: rows.some((r) => r.busy), ids: rows.flatMap((r) => (r.saved ? [r.saved.id] : [])) };
}
