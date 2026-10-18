import { useQuery } from "@tanstack/react-query";
import { useIsAuthed, useSession } from "@/entities/session";
import { fetchDocs, listChatRooms, listPayments } from "../api/statsApi";

export const statsKeys = {
  all: ["client-stats"] as const,
  docTotals: ["client-stats", "docs-total"] as const,
  docs: (status: string) => ["client-stats", "docs", status] as const,
  docsRecent: ["client-stats", "docs-recent"] as const,
  payments: ["client-stats", "payments"] as const,
  chats: ["client-stats", "chats"] as const,
};

const STALE = 30 * 1000;

// Archive size and how many are ready — two one-row requests, only the `total` is read.
export function useDocTotals() {
  const authed = useIsAuthed();
  return useQuery({
    queryKey: statsKeys.docTotals,
    enabled: authed,
    staleTime: STALE,
    queryFn: async () => {
      const [all, ready] = await Promise.all([fetchDocs({ limit: 1, offset: 0 }), fetchDocs({ limit: 1, offset: 0, status: "file_ready" })]);
      return { total: all.total, ready: ready.total };
    },
  });
}

export function usePayments() {
  const authed = useIsAuthed();
  return useQuery({ queryKey: statsKeys.payments, queryFn: listPayments, enabled: authed, staleTime: STALE });
}

export function useChatRooms() {
  const myId = useSession()?.user.id ?? "";
  return useQuery({ queryKey: statsKeys.chats, queryFn: () => listChatRooms(myId), enabled: !!myId, staleTime: STALE });
}

// The five most recently changed documents, for the Home drawer.
export function useRecentDocs() {
  const authed = useIsAuthed();
  return useQuery({ queryKey: statsKeys.docsRecent, queryFn: () => fetchDocs({ limit: 5, offset: 0 }).then((p) => p.items), enabled: authed, staleTime: STALE });
}
