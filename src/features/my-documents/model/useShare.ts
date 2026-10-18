import { useState } from "react";
import { downloadAndShare } from "@/shared/lib/files";
import { errorHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import type { FileRef } from "@/shared/ui/preview";

// "Download": fetch with the bearer token into the cache, then the system share sheet (save to Files…).
export function useShare() {
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const share = async (f: FileRef) => {
    if (busy || !f.path) return;
    setBusy(true);
    try {
      await downloadAndShare(f.path, f.name ?? "document", f.mime);
    } catch {
      errorHaptic();
      toast(t("dm3.downloadFail"), "err");
    } finally {
      setBusy(false);
    }
  };
  return { busy, share };
}
