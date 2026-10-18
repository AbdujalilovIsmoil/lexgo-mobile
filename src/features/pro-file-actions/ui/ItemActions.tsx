import { useState } from "react";
import type { Folder } from "@/entities/pro-files";
import { useT } from "@/shared/i18n";
import { useKept } from "@/shared/lib/useKept";
import { ActionList, type ActionItem } from "@/shared/ui/admin";
import { idOf, nameOf, starredOf, type Target } from "../model/types";
import { useItemOps } from "../model/useItemOps";
import type { useOpenFile } from "../model/useOpenFile";
import { DetailsSheet } from "./DetailsSheet";
import { MoveSheet } from "./MoveSheet";
import { NameSheet } from "./NameSheet";

type Props = { target: Target | null; onClose: () => void; folders: Folder[]; opener: ReturnType<typeof useOpenFile>; onEnter: (id: string) => void };

// "More" menu of a folder / file and the sheets behind it: rename, move, details, delete.
export function ItemActions({ target, onClose, folders, opener, onEnter }: Props) {
  const { t } = useT();
  const kept = useKept(target);
  const [sub, setSub] = useState<"rename" | "move" | "details" | null>(null);
  const ops = useItemOps(kept);
  const close = () => setSub(null);
  if (!kept) return null;
  const { patch, remove } = ops;
  const folder = kept.kind === "folder";
  const actions: ActionItem[] = [
    kept.kind === "folder" ? { key: "open", label: t("aw8.act.open"), icon: "folder", onPress: () => onEnter(idOf(kept)) } : { key: "open", label: t("aw8.act.open"), icon: "eye", onPress: () => void opener.open(kept.file) },
    ...(kept.kind === "file" ? [{ key: "share", label: t("aw8.act.share"), icon: "share-2" as const, onPress: () => void opener.share(kept.file) }] : []),
    { key: "rename", label: t("aw8.act.rename"), icon: "edit-2", onPress: () => setSub("rename") },
    { key: "move", label: t("aw8.act.move"), icon: "corner-up-right", onPress: () => setSub("move") },
    { key: "star", label: starredOf(kept) ? t("aw8.act.unstar") : t("aw8.act.star"), icon: "star", onPress: () => patch({ starred: !starredOf(kept) }) },
    ...(kept.kind === "file" ? [{ key: "info", label: t("aw8.act.details"), icon: "info" as const, onPress: () => setSub("details") }] : []),
    { key: "delete", label: t("adm.delete"), icon: "trash-2", danger: true, onPress: remove },
  ];
  return (
    <>
      <ActionList visible={!!target} onClose={onClose} title={nameOf(kept)} actions={actions} />
      <NameSheet visible={sub === "rename"} onClose={close} title={t("aw8.renameTitle")} label={t("aw8.newName")} initial={nameOf(kept)} submitting={ops.saving} onSubmit={(name) => patch({ name }, close)} />
      <MoveSheet visible={sub === "move"} onClose={close} folders={folders} exclude={folder ? idOf(kept) : undefined} current={kept.kind === "folder" ? kept.folder.parentId : kept.file.folderId} onPick={(folderId) => patch({ folderId })} />
      <DetailsSheet visible={sub === "details"} onClose={close} file={kept.kind === "file" ? kept.file : null} />
    </>
  );
}
