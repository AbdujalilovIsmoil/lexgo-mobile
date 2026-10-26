import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { chatKeys, listRooms, type Room } from "@/entities/secure-chat";
import { useIsAuthed } from "@/entities/session";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { archiveCase, createCase, getCase, listCases, updateCase } from "../api/caseApi";
import { caseTimeline, listCaseDocs, runCaseAi } from "../api/extraApi";
import type { CaseAiTool, CaseInput } from "./types";

export const caseKeys = { all: ["pro-cases"] as const };

export const useCases = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: [...caseKeys.all, "list"], queryFn: listCases, enabled: authed });
};
export const useCase = (id: string) => useQuery({ queryKey: [...caseKeys.all, "one", id], queryFn: () => getCase(id), enabled: !!id });
export const useCaseTimeline = (id: string) => useQuery({ queryKey: [...caseKeys.all, "timeline", id], queryFn: () => caseTimeline(id), enabled: !!id });
// The private room of this case (or of its order), "" when there is none: looked up in the app's one chat list, not fetched again.
export function useCaseRoom(id: string, orderId: string) {
  const select = useCallback((rooms: Room[]) => (rooms.find((r) => r.caseId === id) ?? (orderId ? rooms.find((r) => r.orderId === orderId) : undefined))?.id ?? "", [id, orderId]);
  return useQuery({ queryKey: chatKeys.rooms, queryFn: listRooms, enabled: !!id, select });
}
export const useCaseDocs = (id: string) => useQuery({ queryKey: [...caseKeys.all, "docs", id], queryFn: () => listCaseDocs(id), enabled: !!id });

const inv = [caseKeys.all];
export const useCreateCase = () => useAdminMutation({ mutationFn: (b: CaseInput & { title: string }) => createCase(b), invalidate: inv, success: "aw4.created" });
export const useUpdateCase = () => useAdminMutation({ mutationFn: ({ id, ...b }: CaseInput & { id: string }) => updateCase(id, b), invalidate: inv, success: "aw4.saved" });
export const useArchiveCase = () => useAdminMutation({ mutationFn: (id: string) => archiveCase(id), invalidate: inv, success: "aw4.archived" });
export const useCaseAi = () => useAdminMutation({ mutationFn: ({ id, tool }: { id: string; tool: CaseAiTool }) => runCaseAi(id, tool) });
