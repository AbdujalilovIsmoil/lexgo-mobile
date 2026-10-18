import { skipToken, useQuery } from "@tanstack/react-query";
import { usePaged } from "@/shared/lib/usePaged";
import { getChat, getDoc, getPolicy, listFlow, listLite, listVersions } from "../api/readApi";
import type { DocFilters } from "./types";

// One prefix: invalidating ["my-docs"] refreshes the list, counts and every open detail.
export const docKeys = { all: ["my-docs"] as const };
export const FLOW_PAGE = 10;

export const useDocFlow = (f: DocFilters, enabled = true) =>
  usePaged([...docKeys.all, "flow", f.mode, f.status], ({ limit, offset }) => listFlow({ mode: f.mode, status: f.status, limit, offset }), { pageSize: FLOW_PAGE, enabled });

export const useDocLite = () => useQuery({ queryKey: [...docKeys.all, "lite"], queryFn: listLite });
export const useDoc = (id: string) => useQuery({ queryKey: [...docKeys.all, "doc", id], queryFn: () => getDoc(id), enabled: !!id });
export const useDocPolicy = (id: string, enabled = true) => useQuery({ queryKey: [...docKeys.all, "policy", id], queryFn: () => getPolicy(id), enabled: !!id && enabled });
export const useDocVersions = (id: string) => useQuery({ queryKey: [...docKeys.all, "versions", id], queryFn: () => listVersions(id), enabled: !!id });
// The chat room of a document request. The chat list (already loaded and kept live for the unread badge) names the
// document requests behind each room, so a list of documents costs no request per card; GET …/chat is only the
// fallback while that list is not available.
const ROOMS = ["secure-chat", "rooms"] as const;
export function useDocChat(id: string, enabled: boolean) {
  const rooms = useQuery({ queryKey: ROOMS, queryFn: skipToken, select: (list: { id: string; docIds: string[] }[]) => list.find((r) => r.docIds.includes(id))?.id ?? "" });
  const room = rooms.data ?? "";
  const own = useQuery({ queryKey: [...docKeys.all, "chat", id], queryFn: () => getChat(id), enabled: !!id && enabled && !room && rooms.data === undefined });
  return room ? { ...own, isLoading: false, data: { available: true, roomId: room, message: "" } } : own;
}
