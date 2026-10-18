import { useState } from "react";
import { downloadAndShare } from "@/shared/lib/files";
import { errorHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import type { DocFile } from "@/entities/doc-queue";

// "Download": fetch the file with the bearer token into the cache, then the system share sheet (save to Files…).
export function useFileShare() {
  const { t } = useT();
  const [busy, setBusy] = useState("");
  const share = async (f: DocFile) => {
    if (busy || !f.path) return;
    setBusy(f.id);
    try {
      await downloadAndShare(f.path, f.name || "document", f.mime || undefined);
    } catch {
      errorHaptic();
      toast(t("proDocSheet.dlFail"), "err");
    } finally {
      setBusy("");
    }
  };
  return { busy, share };
}
