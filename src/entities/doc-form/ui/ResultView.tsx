import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, toast } from "@/shared/ui";
import { FilePreview } from "@/shared/ui/preview";
import { useT } from "@/shared/i18n";
import { downloadAndShare } from "@/shared/lib/files";
import { errorHaptic } from "@/shared/lib/haptics";
import type { GeneratedDoc } from "../model/types";
import { GeneratedCard } from "./GeneratedCard";

type Props = { doc: GeneratedDoc; onNew: () => void; onOpenDocs: () => void };

// Result of generate: the server-built file can be viewed, shared / saved, and the
// request found again under "Mening hujjatlarim". The mobile app never builds files.
export function ResultView({ doc, onNew, onOpenDocs }: Props) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const file = doc.file;
  const name = `${doc.title || doc.workId || "document"}.${file?.format || "docx"}`;
  const share = async () => {
    if (!file || busy) return;
    setBusy(true);
    try {
      await downloadAndShare(file.path, name, file.mime);
    } catch {
      errorHaptic();
      toast(t("dc4.shareFailed"), "err");
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={s.col}>
      <GeneratedCard doc={doc} busy={busy} onView={() => setOpen(true)} onShare={() => void share()} />
      {doc.requestId ? <Button title={t("dc4.myDocs")} icon="folder" variant="line" onPress={onOpenDocs} full /> : null}
      <Button title={t("dc4.another")} icon="plus" variant="ghost" onPress={onNew} full />
      <FilePreview visible={open} onClose={() => setOpen(false)} file={file ? { path: file.path, name, mime: file.mime } : null} />
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 12 } });
