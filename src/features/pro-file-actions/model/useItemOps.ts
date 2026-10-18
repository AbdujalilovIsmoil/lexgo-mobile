import { useDeleteFile, useDeleteFolder, useUpdateFile, useUpdateFolder } from "@/entities/pro-files";
import { useT } from "@/shared/i18n";
import { confirmDialog } from "@/shared/ui";
import { idOf, nameOf, type Target } from "./types";

export type Change = { name?: string; folderId?: string; starred?: boolean };

// Update / delete operations of one folder or file target (rename, move, star, confirmed delete).
export function useItemOps(target: Target | null) {
  const { t } = useT();
  const updFolder = useUpdateFolder();
  const updFile = useUpdateFile();
  const delFolder = useDeleteFolder();
  const delFile = useDeleteFile();
  const parent = (c: Change) => (c.folderId === undefined ? undefined : c.folderId || null);

  const patch = (c: Change, done?: () => void) => {
    if (!target) return;
    const opts = { onSuccess: done };
    if (target.kind === "folder") updFolder.mutate({ id: idOf(target), name: c.name, parent_id: parent(c), starred: c.starred }, opts);
    else updFile.mutate({ id: idOf(target), file_name: c.name, folder_id: parent(c), starred: c.starred }, opts);
  };

  const remove = () => {
    if (!target) return;
    const folder = target.kind === "folder";
    confirmDialog({
      title: t("adm.confirmDeleteTitle"),
      message: folder ? t("aw8.deleteFolder", { name: nameOf(target), n: target.folder.fileCount + target.folder.folderCount }) : t("aw8.deleteFile", { name: nameOf(target) }),
      confirmLabel: t("adm.delete"), cancelLabel: t("adm.cancel"), icon: "trash-2", danger: true,
      onConfirm: () => (folder ? delFolder : delFile).mutate(idOf(target)),
    });
  };
  return { patch, remove, saving: updFolder.isPending || updFile.isPending };
}
