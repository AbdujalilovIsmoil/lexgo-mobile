import { useState } from "react";
import { View } from "react-native";
import { useCreateFolder } from "@/entities/pro-files";
import { NameSheet } from "@/features/pro-file-actions";
import { useT } from "@/shared/i18n";
import { Button } from "@/shared/ui";

// Toolbar of the browser: new folder (name sheet) and upload.
export function FolderButtons({ parent, onUpload, busy }: { parent: string; onUpload: () => void; busy: boolean }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const create = useCreateFolder();
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <Button title={t("aw8.newFolder")} icon="folder-plus" variant="soft" size="sm" onPress={() => setOpen(true)} />
      <Button title={t("aw8.upload")} icon="upload" variant="gradient" size="sm" loading={busy} onPress={onUpload} />
      <NameSheet visible={open} onClose={() => setOpen(false)} title={t("aw8.newFolder")} label={t("aw8.folderName")} initial="" submitting={create.isPending} onSubmit={(name) => create.mutate({ name, parent_id: parent || undefined }, { onSuccess: () => setOpen(false) })} />
    </View>
  );
}
