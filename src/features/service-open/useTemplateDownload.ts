import { useState } from "react";
import { getTemplateSource, isPlanRequired } from "@/entities/service";
import { useIsFreeAiTier } from "@/entities/plan";
import { downloadAuthed, shareFile } from "@/shared/lib/files";
import { cleanDocTitle } from "@/shared/lib/doc/cleanTitle";
import { useT } from "@/shared/i18n";

const FILE_EXT = /\.([A-Za-z0-9]{1,8})$/;

export type TemplateTarget = { id: string; name: string };

// "Download" on a catalogue card. Free LexGo.AI tier -> `upgrade` opens the plan picker; a plan without
// the manual-documents entitlement answers 402 -> `planMsg` carries the server's own sentence.
// Otherwise the clean template (no {{field}} markers) is saved through the share sheet.
export function useTemplateDownload() {
  const { t } = useT();
  const free = useIsFreeAiTier();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState<{ id: string; msg: string } | null>(null);
  const [planMsg, setPlanMsg] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState(false);

  const download = async (s: TemplateTarget) => {
    if (free) return setUpgrade(true);
    if (busy) return;
    setError(null);
    setBusy(s.id);
    try {
      const src = await getTemplateSource(s.id);
      if (!src.hasFile) throw new Error("no_file");
      const ext = src.name.match(FILE_EXT)?.[1] ?? "docx";
      const name = `${cleanDocTitle(src.name.replace(FILE_EXT, "")) || cleanDocTitle(s.name) || t("csv.docViewTitle")}.${ext}`;
      await shareFile(await downloadAuthed(src.path, name), src.mime || undefined);
    } catch (e) {
      if (isPlanRequired(e)) setPlanMsg(e.detail || t("csv.planRequired"));
      else setError({ id: s.id, msg: t("csv.downloadError") });
    } finally {
      setBusy("");
    }
  };

  return { free, busy, error, download, planMsg, closePlan: () => setPlanMsg(null), upgrade, setUpgrade };
}
