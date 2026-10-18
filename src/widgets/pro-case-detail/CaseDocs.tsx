import { useState } from "react";
import { FormInput, useAppForm } from "@/shared/form";
import { View } from "react-native";
import { useAddCaseDoc, useCaseDocs } from "@/entities/pro-cases";
import { FileRow, useTree } from "@/entities/pro-files";
import { useOpenFile } from "@/features/pro-file-actions";
import { UploadBar, UploadMenu, useUpload } from "@/features/pro-file-upload";
import { useT } from "@/shared/i18n";
import { Button, Text } from "@/shared/ui";
import { EmptyTile, SectionHead } from "./CaseSection";
import { RowCard } from "@/shared/ui/admin";
import { FilePreview } from "@/shared/ui/preview";
import { recordSchema } from "./recordSchema";

// Documents of a case: workspace files attached to it (upload / preview) and title-only document records.
export function CaseDocs({ caseId }: { caseId: string }) {
  const { t } = useT();
  const tree = useTree(caseId);
  const records = useCaseDocs(caseId);
  const add = useAddCaseDoc();
  const opener = useOpenFile();
  const up = useUpload({ caseId }, tree.data?.quota);
  const [menu, setMenu] = useState(false);
  const f = useAppForm(recordSchema, { title: "" });
  const files = (tree.data?.files ?? []).filter((f) => f.caseId === caseId);
  const save = f.handleSubmit((v) => add.mutate({ id: caseId, title: v.title }, { onSuccess: () => f.reset() }));
  return (
    <View style={{ gap: 12 }}>
      <SectionHead title={t("aw5.files")} onAdd={() => setMenu(true)} busy={up.state.busy} label={t("aw8.upload")} />
      <UploadBar state={up.state} onCancel={up.cancel} />
      {tree.isError ? <Text variant="small" tone="gray" center>{t("aw8.pendingText")}</Text> : files.length ? files.map((f) => <FileRow key={f.id} file={f} onOpen={() => void opener.open(f)} onMore={() => void opener.share(f)} />) : <EmptyTile icon="upload-cloud" text={t("aw5.noFiles")} />}
      <SectionHead title={t("aw5.records")} />
      {(records.data ?? []).length ? records.data?.map((d) => <RowCard key={d.id} icon="file-text" title={d.title} subtitle={d.workId} />) : <EmptyTile icon="file-text" text={t("aw5.noRecords")} />}
      <FormInput control={f.control} name="title" placeholder={t("aw5.recordPh")} returnKeyType="done" onSubmitEditing={() => void save()} />
      <Button title={t("adm.add")} icon="plus" size="sm" loading={add.isPending} onPress={() => void save()} />
      <UploadMenu visible={menu} onClose={() => setMenu(false)} onPick={(s) => void up.start(s)} />
      <FilePreview visible={opener.visible} onClose={opener.close} file={opener.opened} />
    </View>
  );
}
