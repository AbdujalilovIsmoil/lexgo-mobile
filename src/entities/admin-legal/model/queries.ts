import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { listDocs, listUserConsents, patchDoc, saveDoc, setDocActive } from "../api/legalApi";
import type { DocInput } from "./types";

export const legalKeys = { all: ["admin-legal"] as const };

export const useDocs = () => useQuery({ queryKey: [...legalKeys.all, "docs"], queryFn: listDocs });
export const useUserConsents = (userId: string) => useQuery({ queryKey: [...legalKeys.all, "consents", userId], queryFn: () => listUserConsents(userId) });

// Publishing changes what every user is asked to accept, so the docs list is refetched.
export const usePublishDoc = () => useAdminMutation({ mutationFn: (i: DocInput) => saveDoc(i), invalidate: [legalKeys.all], success: "admLegal.saved" });
export const useEditDoc = () => useAdminMutation({ mutationFn: (v: { id: string; doc: Omit<DocInput, "slug"> }) => patchDoc(v.id, v.doc), invalidate: [legalKeys.all], success: "admLegalB.edited" });
export const useToggleDoc = () => useAdminMutation({ mutationFn: (v: { id: string; active: boolean }) => setDocActive(v.id, v.active), invalidate: [legalKeys.all], success: "admLegalB.edited" });
