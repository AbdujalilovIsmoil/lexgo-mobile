import { useState } from "react";
import { View } from "react-native";
import { FileRow, useTree } from "@/entities/pro-files";
import { ItemActions, useOpenFile, type Target } from "@/features/pro-file-actions";
import { UploadBar, UploadMenu, useUpload } from "@/features/pro-file-upload";
import { useT } from "@/shared/i18n";
import { Text } from "@/shared/ui";
import { EmptyTile, SectionHead } from "./CaseSection";
import { FilePreview } from "@/shared/ui/preview";

// Documents of a case: the workspace files attached to it (upload / preview, and the same "more" menu as in Fayllar).
export function CaseDocs({ caseId }: { caseId: string }) {
  const { t } = useT();
  const tree = useTree(caseId);
  const opener = useOpenFile();
  const up = useUpload({ caseId }, tree.data?.quota);
  const [menu, setMenu] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const files = (tree.data?.files ?? []).filter((f) => f.caseId === caseId);
  return (
    <View style={{ gap: 12 }}>
      <SectionHead title={t("aw5.files")} onAdd={() => setMenu(true)} busy={up.state.busy} label={t("aw8.upload")} />
      <UploadBar state={up.state} onCancel={up.cancel} />
      {tree.isError ? <Text variant="small" tone="gray" center>{t("aw8.pendingText")}</Text> : files.length ? files.map((f) => <FileRow key={f.id} file={f} onOpen={() => void opener.open(f)} onMore={() => setTarget({ kind: "file", file: f })} />) : <EmptyTile icon="upload-cloud" text={t("aw5.noFiles")} />}
      <UploadMenu visible={menu} onClose={() => setMenu(false)} onPick={(s) => void up.start(s)} />
      <ItemActions target={target} onClose={() => setTarget(null)} folders={tree.data?.folders ?? []} opener={opener} onEnter={() => setTarget(null)} />
      <FilePreview visible={opener.visible} onClose={opener.close} file={opener.opened} />
    </View>
  );
}
