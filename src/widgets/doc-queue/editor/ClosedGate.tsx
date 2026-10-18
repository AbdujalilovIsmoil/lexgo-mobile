import { useState } from "react";
import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { DocFile, DocReq } from "@/entities/doc-queue";
import { FulfillSheet } from "@/features/doc-editor";
import { GateCard } from "./GateCard";

type Props = { doc: DocReq; upload: boolean; onRetry: () => void; onFile: (f: DocFile) => void };

// The backend closed the editor (can_open_editor=false): say why in its own words, offer the template / own-file route.
export function ClosedGate({ doc, upload, onRetry, onFile }: Props) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  return (
    <GateCard icon="lock" tone="warn" title={t("ad1.blockedTitle")} text={doc.blockReason || t("ad1.blockedFallback")}>
      {!doc.systemEditor ? <Button title={t("ad1.noSystemEditor")} variant="ghost" size="sm" /> : null}
      {doc.templateFile ? <Button title={t("ad1.viewTemplate")} icon="eye" variant="line" onPress={() => doc.templateFile && onFile(doc.templateFile)} /> : null}
      {upload ? <Button title={t("ad1.sendOwn")} icon="upload" variant="soft" onPress={() => setOpen(true)} /> : null}
      <Button title={t("common.retry")} icon="refresh-cw" variant="line" onPress={onRetry} />
      <FulfillSheet doc={doc} visible={open} onClose={() => setOpen(false)} onSent={() => setOpen(false)} />
    </GateCard>
  );
}
