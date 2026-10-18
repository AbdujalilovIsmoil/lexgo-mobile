import { useState } from "react";
import { View } from "react-native";
import { Button, Card, Text, toast } from "@/shared/ui";
import { STUDIO_FILE_EXT, downloadVersionFile, useStudioErrorText } from "@/entities/admin-studio";
import { useT } from "@/shared/i18n";
import { pickStudioFile } from "../object/pickFile";
import type { EditorFile, PickedFile } from "../form/types";

type Props = { file: EditorFile | null; onUpload: ((f: PickedFile) => Promise<void>) | null; readOnly: boolean; error?: string };

// The file of the current version (K06 upload mode): name, download, pick a new one.
export function FileBox({ file, onUpload, readOnly, error }: Props) {
  const { t } = useT();
  const errText = useStudioErrorText();
  const [busy, setBusy] = useState(false);
  const has = !!file?.hasFile;
  const upload = async () => {
    const r = await pickStudioFile();
    if (!r || !onUpload) return;
    if (!r.file) return toast(t(r.error === "empty" ? "admStudioB.file.empty" : "admStudioB.file.badType"), "err");
    setBusy(true);
    try {
      await onUpload(r.file);
    } catch (e) {
      toast(errText(e), "err");
    } finally {
      setBusy(false);
    }
  };
  const download = () => file?.versionId && downloadVersionFile(file.versionId, file.fileName).catch((e) => toast(errText(e), "err"));
  return (
    <Card style={{ gap: 10 }}>
      <Text variant="body" weight="bold">{has ? file?.fileName || t("admStudioB.file.unnamed") : t("admStudioB.file.none")}</Text>
      <Text variant="caption" tone={error && !has ? "err" : "gray"}>{error && !has ? t("admStudioB.err.fileMode") : has ? t("admStudioB.file.hasHint") : onUpload ? t("admStudioB.file.pickHint", { ext: STUDIO_FILE_EXT.join(", ") }) : readOnly ? t("admStudioB.file.roHint") : t("admStudioB.file.saveFirst")}</Text>
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        {has && file?.versionId ? <Button title={t("adm.download")} icon="download" variant="line" size="sm" onPress={download} /> : null}
        {onUpload && !readOnly ? <Button title={has ? t("admStudioB.file.replace") : t("admStudioB.file.upload")} icon="upload" variant="soft" size="sm" loading={busy} onPress={upload} /> : null}
      </View>
    </Card>
  );
}
