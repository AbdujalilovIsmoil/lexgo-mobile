import { useState } from "react";
import { useDocRefusal } from "@/entities/doc-settings";
import { cleanTemplatePath } from "@/entities/doc-template";
import { gateOfFeature, planGateOf, useFeature, type PlanGate } from "@/entities/plan";
import { useTemplateDownload } from "@/features/service-open";
import { trackDoc } from "@/shared/analytics";
import { downloadAuthed, shareFile } from "@/shared/lib/files";
import { cleanDocTitle } from "@/shared/lib/doc/cleanTitle";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type Target = { id: string; name: string; category?: string; language?: string };

// "Download clean template" (README §9). A template with a linked service goes through the service's own clean file (and its plan gates);
// a template without one through GET /document-templates/{id}/clean-source-file. Both are authenticated binary downloads handed to the share
// sheet — never an unauthenticated browser link, never the marker-bearing source file. The backend's template_download state (locked / used
// up) or a 402 opens the plan sheet with the backend's code, and the page stays where it is; any other refusal of the document service
// (TZ.md §4) is said in plain words.
export function useCleanTemplate(t: Target, serviceId?: string) {
  const { t: tr } = useT();
  const refusal = useDocRefusal();
  const linked = useTemplateDownload();
  const stop = gateOfFeature(useFeature("template_download"), "template_download");
  const [busy, setBusy] = useState(false);
  const [gate, setGate] = useState<PlanGate | null>(null);
  const [seen, setSeen] = useState(false); // the plan stopped it once: the page keeps saying which capability is missing

  const own = async () => {
    if (stop) {
      setSeen(true);
      return setGate(stop);
    }
    if (busy) return;
    setBusy(true);
    try {
      const name = `${cleanDocTitle(t.name) || tr("dcat.title")}.docx`;
      await shareFile(await downloadAuthed(cleanTemplatePath(t.id), name), DOCX);
      trackDoc("document_clean_template_downloaded", { category: t.category, language: t.language });
    } catch (e) {
      const refused = refusal(e);
      const g = planGateOf(e);
      if (g) {
        setSeen(true);
        setGate(g);
      } else toast(refused ?? tr("csv.downloadError"), "err");
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    if (!serviceId) return own();
    await linked.download({ id: serviceId, name: t.name });
    trackDoc("document_clean_template_downloaded", { category: t.category, language: t.language });
  };
  const gates = serviceId ? { gate: linked.gate, closeGate: linked.closeGate } : { gate, closeGate: () => setGate(null) };
  return { busy: serviceId ? !!linked.busy : busy, download, gates, planSeen: seen || !!linked.gate };
}
