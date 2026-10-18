import { useState } from "react";
import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { DocReq } from "@/entities/doc-queue";
import { GateCard } from "./GateCard";
import { FileOpen } from "./FileOpen";

type Props = { doc: DocReq; fileUrl: string; onRetry: () => void; reason?: "off" | "failed" };

// The online editor is not available (server not configured / page failed to load): the draft file can still
// be opened or shared from the phone, and the advocate can send an own .docx instead.
export function EditorFallback({ doc, fileUrl, onRetry, reason = "off" }: Props) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  return (
    <GateCard icon="cloud-off" tone="warn" title={t(reason === "off" ? "ad5.offTitle" : "ad5.failTitle")} text={t(reason === "off" ? "ad5.offText" : "ad5.failText")}>
      {fileUrl ? <Button title={t("ad5.openDraft")} icon="eye" variant="line" onPress={() => setOpen(true)} /> : null}
      <Button title={t("common.retry")} icon="refresh-cw" variant="line" onPress={onRetry} />
      <FileOpen visible={open} onClose={() => setOpen(false)} path={fileUrl} name={`${doc.title || "document"}.docx`} />
    </GateCard>
  );
}
