import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { addComment, getLimits, listComments, listDocRequests, listVersions, requestClientDocument } from "../api/fileApi";
import { createFolder, deleteFile, deleteFolder, getTree, updateFile, updateFolder } from "../api/treeApi";
import type { FilePatch, FolderPatch, Tree } from "./types";

export const fileKeys = { all: ["pro-files"] as const };
const inv = [fileKeys.all];

export const useTree = (caseId?: string) => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: [...fileKeys.all, "tree", caseId ?? ""], queryFn: () => getTree(caseId), enabled: authed, retry: false });
};
export const useLimits = () => useQuery({ queryKey: [...fileKeys.all, "limits"], queryFn: getLimits, staleTime: 30 * 60 * 1000 });
export const useVersions = (id: string) => useQuery({ queryKey: [...fileKeys.all, "versions", id], queryFn: () => listVersions(id), enabled: !!id });
export const useComments = (id: string) => useQuery({ queryKey: [...fileKeys.all, "comments", id], queryFn: () => listComments(id), enabled: !!id });
export const useDocRequests = () => useQuery({ queryKey: [...fileKeys.all, "requests"], queryFn: listDocRequests });

// The new folder shows up in every cached tree at once (the refetch then replaces it with the server's copy).
export const useCreateFolder = () => {
  const qc = useQueryClient();
  return useAdminMutation({
    mutationFn: createFolder,
    invalidate: inv,
    success: "aw8.folderCreated",
    onSuccess: (f) => {
      if (!f.id) return;
      qc.setQueriesData<Tree>({ queryKey: [...fileKeys.all, "tree"] }, (old) => (old && !old.folders.some((x) => x.id === f.id) ? { ...old, folders: [...old.folders, f] } : old));
    },
  });
};
export const useUpdateFolder = (success?: string) => useAdminMutation({ mutationFn: ({ id, ...b }: FolderPatch & { id: string }) => updateFolder(id, b), invalidate: inv, success });
export const useUpdateFile = (success?: string) => useAdminMutation({ mutationFn: ({ id, ...b }: FilePatch & { id: string }) => updateFile(id, b), invalidate: inv, success });
export const useDeleteFolder = () => useAdminMutation({ mutationFn: (id: string) => deleteFolder(id), invalidate: inv, success: "aw8.deleted" });
export const useDeleteFile = () => useAdminMutation({ mutationFn: (id: string) => deleteFile(id), invalidate: inv, success: "aw8.deleted" });
export const useAddComment = () => useAdminMutation({ mutationFn: ({ id, text }: { id: string; text: string }) => addComment(id, text), invalidate: inv });
export const useRequestDocument = () => useAdminMutation({ mutationFn: requestClientDocument, invalidate: inv, success: "aw8.requested" });
