import type { Folder, WFile } from "@/entities/pro-files";

export type Target = { kind: "folder"; folder: Folder } | { kind: "file"; file: WFile };
export const nameOf = (t: Target): string => (t.kind === "folder" ? t.folder.name : t.file.name);
export const idOf = (t: Target): string => (t.kind === "folder" ? t.folder.id : t.file.id);
export const starredOf = (t: Target): boolean => (t.kind === "folder" ? t.folder.starred : t.file.starred);
