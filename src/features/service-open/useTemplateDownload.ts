import { useState } from "react";
import { getTemplateSource } from "@/entities/service";
import { gateOfFeature, planGateOf, useFeature, useFeatureLabel, type PlanGate } from "@/entities/plan";
import { useDocRefusal, useDocSettings } from "@/entities/doc-settings";
import { downloadAuthed, shareFile } from "@/shared/lib/files";
import { cleanDocTitle } from "@/shared/lib/doc/cleanTitle";
import { useT } from "@/shared/i18n";

const FILE_EXT = /\.([A-Za-z0-9]{1,8})$/;
const FEATURE = "template_download";

export type TemplateTarget = { id: string; name: string };

// "Download" on a catalogue card, gated by the backend's own feature state (GET /subscriptions/me/features), not by the tariff's name: a
// locked `template_download` or a used-up limit opens the plan sheet before anything is fetched, a limited one says how many are left, and
// any 402 the download still gets opens the same sheet with the backend's code. Otherwise the clean template (no {{field}} markers) is saved
// through the share sheet — unless its format is closed for downloads by the document service settings, which is said up front, as is any
// other document service refusal (TZ.md §4). The download endpoint counts the use itself; the phone keeps no counter.
export function useTemplateDownload() {
  const { t } = useT();
  const feature = useFeature(FEATURE);
  const label = useFeatureLabel();
  const ok = useDocSettings().downloadOk;
  const refusal = useDocRefusal();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState<{ id: string; msg: string } | null>(null);
  const [gate, setGate] = useState<PlanGate | null>(null);
  const stop = gateOfFeature(feature, FEATURE);
  const note = feature?.mode === "limited" && feature.remaining !== null && feature.remaining > 0 ? t("subq.gate.left", { feature: label(FEATURE), n: feature.remaining }) : "";

  const download = async (s: TemplateTarget) => {
    if (stop) return setGate(stop);
    if (busy) return;
    setError(null);
    setBusy(s.id);
    try {
      const src = await getTemplateSource(s.id);
      if (!src.hasFile) throw new Error("no_file");
      const ext = src.name.match(FILE_EXT)?.[1] ?? "docx";
      if (!ok(ext)) return setError({ id: s.id, msg: t("dset.code.document_download_format_disabled") });
      const name = `${cleanDocTitle(src.name.replace(FILE_EXT, "")) || cleanDocTitle(s.name) || t("csv.docViewTitle")}.${ext}`;
      await shareFile(await downloadAuthed(src.path, name), src.mime || undefined);
    } catch (e) {
      const refused = refusal(e);
      const g = planGateOf(e);
      if (g) setGate(g);
      else setError({ id: s.id, msg: refused ?? t("csv.downloadError") });
    } finally {
      setBusy("");
    }
  };

  return { locked: !!stop, note, busy, error, download, gate, closeGate: () => setGate(null) };
}
