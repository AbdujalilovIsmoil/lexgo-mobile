import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsFocused } from "expo-router";
import { usePaged } from "@/shared/lib/usePaged";
import { useSocketState } from "@/shared/realtime";
import { getTicket, listMyTickets } from "../api/ticketApi";
import { hoursState, useBusinessHoursQuery } from "@/entities/business-hours";
import { getSupportMeta } from "../api/metaApi";
import { loadChat } from "./chatCache";
import { supKeys } from "./keys";
import type { SupportHours, TicketTab } from "./types";

// Poll only while the socket is down (events refetch everything while it is up).
function useFallbackPoll(ms: number): number | false {
  const focused = useIsFocused();
  const online = useSocketState() === "online";
  return focused && !online ? ms : false;
}

/** "My chats", one tab at a time (the server filters by status and pages). */
export function useMyTickets(tab: TicketTab, enabled = true) {
  return usePaged(supKeys.list(tab), ({ limit, offset }) => listMyTickets(tab, { limit, offset }), { enabled });
}

export function useTicket(id: string) {
  const refetchInterval = useFallbackPoll(20_000);
  return useQuery({ queryKey: supKeys.ticket(id), queryFn: () => getTicket(id), enabled: !!id, refetchInterval });
}

/** Newest page of the chat, merged with what is held (see chatCache). */
export function useChat(id: string) {
  const qc = useQueryClient();
  const refetchInterval = useFallbackPoll(10_000);
  return useQuery({ queryKey: supKeys.chat(id), queryFn: () => loadChat(qc, id), enabled: !!id, staleTime: 0, refetchInterval });
}

/** The newest ongoing chat (so "new chat" can offer to resume it). */
export function useLatestActive(enabled = true) {
  return useQuery({ queryKey: [...supKeys.lists, "head"], queryFn: async () => (await listMyTickets("active", { limit: 1, offset: 0 })).items[0] ?? null, enabled });
}

/** Unread operator messages over all ongoing chats. */
export function useUnreadTotal(enabled: boolean) {
  return useQuery({
    queryKey: supKeys.unread,
    queryFn: async () => (await listMyTickets("active", { limit: 50, offset: 0 })).items.reduce((n, tk) => n + tk.unreadCount, 0),
    enabled,
    staleTime: 30_000,
  });
}

export function useSupportMeta() {
  return useQuery({ queryKey: supKeys.meta, queryFn: getSupportMeta, staleTime: 3_600_000, retry: false });
}

// The call center's schedule (the shared office hours) and whether it is open now; undefined until known.
export function useSupportHours(): SupportHours | undefined {
  const bh = useBusinessHoursQuery().data;
  return bh ? { open: hoursState(bh) === "open", days: bh.days, start: bh.start, end: bh.end } : undefined;
}
