export type Folder = {
  id: string;
  workId: string;
  name: string;
  parentId: string;
  caseId: string;
  starred: boolean;
  size: number;
  fileCount: number;
  folderCount: number;
  status: string;
  createdAt: string;
};

export type WFile = {
  id: string;
  workId: string;
  folderId: string;
  caseId: string;
  name: string;
  size: number;
  mime: string;
  ext: string;
  starred: boolean;
  status: string;
  scan: string; // antivirus: "" · pending · clean · infected …
  createdAt: string;
};

export type Quota = { quotaBytes: number; usedBytes: number; remainingBytes: number; limitGb: number };
export type Tree = { folders: Folder[]; files: WFile[]; quota: Quota };
export type Limits = { fileMaxMb: number; videoMaxMb: number; allowed: string[]; blocked: string[] };

export type FolderPatch = Partial<{ name: string; parent_id: string | null; case_id: string | null; starred: boolean }>;
export type FilePatch = Partial<{ file_name: string; folder_id: string | null; case_id: string | null; starred: boolean }>;

export type FileVersion = { id: string; version: number; name: string; note: string; size: number; createdAt: string };
export type FileComment = { id: string; text: string; author: string; createdAt: string };
export type DocRequest = { id: string; title: string; message: string; status: string; fileName: string; fileUrl: string; mime: string; createdAt: string };
