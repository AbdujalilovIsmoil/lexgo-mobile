import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { DocFile, DocReq } from "@/entities/doc-queue";
import { GateCard } from "./GateCard";

// Already with the client: read the sent document back instead of reopening the editor.
export function DoneGate({ doc, onFile }: { doc: DocReq; onFile: (f: DocFile) => void }) {
  const { t } = useT();
  return (
    <GateCard icon="check-circle" title={t("ad5.doneTitle")} text={t("ad5.doneText")}>
      {doc.finalFile ? <Button title={t("ad1.viewSent")} icon="eye" variant="gradient" onPress={() => doc.finalFile && onFile(doc.finalFile)} /> : null}
    </GateCard>
  );
}
