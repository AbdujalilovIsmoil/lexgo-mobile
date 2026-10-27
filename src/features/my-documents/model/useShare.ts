import { useState } from "react";
import { useDocRefusal } from "@/entities/doc-settings";
import { trackDoc } from "@/shared/analytics";
import { downloadAndShare } from "@/shared/lib/files";
import { errorHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import type { FileRef } from "@/shared/ui/preview";

// "Download": fetch with the bearer token into the cache, then the system share sheet (save to Files…). A refusal of the document
// service (a closed format, a plan) is said in plain words (TZ.md §4).
export function useShare() {
  const { t } = useT();
  const refusal = useDocRefusal();
  const [busy, setBusy] = useState(false);
  const share = async (f: FileRef) => {
    if (busy || !f.path) return;
    setBusy(true);
    try {
      await downloadAndShare(f.path, f.name ?? "document", f.mime);
      // The blank template and the finished document are different events; neither carries the file's name (it may hold personal data).
      trackDoc(f.path.includes("/clean-template-file") ? "document_clean_template_downloaded" : "document_completed_file_downloaded");
    } catch (e) {
      errorHaptic();
      toast(refusal(e) ?? t("dm3.downloadFail"), "err");
    } finally {
      setBusy(false);
    }
  };
  return { busy, share };
}
