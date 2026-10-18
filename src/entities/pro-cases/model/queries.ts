import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { archiveCase, createCase, getCase, listCases, setCaseStatus, updateCase } from "../api/caseApi";
import { addCaseDoc, caseRoom, caseTimeline, listCaseDocs, runCaseAi } from "../api/extraApi";
import type { CaseAiTool, CaseInput } from "./types";

export const caseKeys = { all: ["pro-cases"] as const };

export const useCases = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: [...caseKeys.all, "list"], queryFn: listCases, enabled: authed });
};
export const useCase = (id: string) => useQuery({ queryKey: [...caseKeys.all, "one", id], queryFn: () => getCase(id), enabled: !!id });
export const useCaseTimeline = (id: string) => useQuery({ queryKey: [...caseKeys.all, "timeline", id], queryFn: () => caseTimeline(id), enabled: !!id });
export const useCaseRoom = (id: string, orderId: string) => useQuery({ queryKey: [...caseKeys.all, "room", id], queryFn: () => caseRoom(id, orderId), enabled: !!id });
export const useCaseDocs = (id: string) => useQuery({ queryKey: [...caseKeys.all, "docs", id], queryFn: () => listCaseDocs(id), enabled: !!id });

const inv = [caseKeys.all];
export const useCreateCase = () => useAdminMutation({ mutationFn: (b: CaseInput & { title: string }) => createCase(b), invalidate: inv, success: "aw4.created" });
export const useUpdateCase = () => useAdminMutation({ mutationFn: ({ id, ...b }: CaseInput & { id: string }) => updateCase(id, b), invalidate: inv, success: "aw4.saved" });
export const useCaseStatus = () => useAdminMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => setCaseStatus(id, status), invalidate: inv, success: "aw4.saved" });
export const useArchiveCase = () => useAdminMutation({ mutationFn: (id: string) => archiveCase(id), invalidate: inv, success: "aw4.archived" });
export const useAddCaseDoc = () => useAdminMutation({ mutationFn: ({ id, title }: { id: string; title: string }) => addCaseDoc(id, title), invalidate: inv, success: "aw4.docAdded" });
export const useCaseAi = () => useAdminMutation({ mutationFn: ({ id, tool }: { id: string; tool: CaseAiTool }) => runCaseAi(id, tool) });
