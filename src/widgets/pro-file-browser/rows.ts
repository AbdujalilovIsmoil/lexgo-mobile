import type { Folder, WFile } from "@/entities/pro-files";

export type Row = { k: "folder"; f: Folder } | { k: "file"; f: WFile };

export const toRows = (folders: Folder[], files: WFile[]): Row[] => [...folders.map((f) => ({ k: "folder" as const, f })), ...files.map((f) => ({ k: "file" as const, f }))];
