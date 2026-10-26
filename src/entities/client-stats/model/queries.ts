import { useQuery } from "@tanstack/react-query";
import { useIsAuthed, useSession } from "@/entities/session";
import { listChatRooms, listPayments } from "../api/statsApi";

export const statsKeys = {
  all: ["client-stats"] as const,
  docTotals: ["client-stats", "docs-total"] as const,
  docs: (status: string) => ["client-stats", "docs", status] as const,
  docsRecent: ["client-stats", "docs-recent"] as const,
  payments: ["client-stats", "payments"] as const,
  chats: ["client-stats", "chats"] as const,
};

const STALE = 30 * 1000;

export function usePayments() {
  const authed = useIsAuthed();
  return useQuery({ queryKey: statsKeys.payments, queryFn: listPayments, enabled: authed, staleTime: STALE });
}

export function useChatRooms() {
  const myId = useSession()?.user.id ?? "";
  return useQuery({ queryKey: statsKeys.chats, queryFn: () => listChatRooms(myId), enabled: !!myId, staleTime: STALE });
}

