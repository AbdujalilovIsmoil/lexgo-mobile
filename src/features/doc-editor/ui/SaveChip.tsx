import { Pill } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtTime } from "@/shared/lib/format";
import type { Save } from "../model/useSaveState";

// Saving… / Saved 14:05 / Save error — nothing while the document is untouched.
export function SaveChip({ save }: { save: Save }) {
  const { t } = useT();
  if (save.state === "idle") return null;
  if (save.state === "saving") return <Pill label={t("ad3.saving")} tone="warn" icon="loader" small />;
  if (save.state === "error") return <Pill label={t("ad3.saveError")} tone="err" icon="alert-triangle" small />;
  return <Pill label={`${t("ad3.saved")} ${fmtTime(save.at)}`.trim()} tone="ok" icon="check" small />;
}
