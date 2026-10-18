import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useIsFocused } from "expo-router";
import { getTicket, listOperators } from "../api/ticketApi";
import { listMessages } from "../api/messageApi";
import { getAssistContext } from "../api/assistApi";
import { POLL, supKeys } from "./keys";

export const CHAT_PAGE = 40;

export function useTicket(id: string) {
  const focused = useIsFocused();
  return useQuery({ queryKey: supKeys.ticket(id), queryFn: () => getTicket(id), enabled: !!id, refetchInterval: focused ? POLL.ticket : false });
}

// Newest page of the chat, polled every 5 s while focused (older pages are loaded on demand by the chat hook).
export function useLatestMessages(id: string, clientUserId: string) {
  const focused = useIsFocused();
  return useQuery({
    queryKey: supKeys.messages(id),
    queryFn: () => listMessages(id, { offset: 0, limit: CHAT_PAGE }, clientUserId),
    enabled: !!id,
    refetchInterval: focused ? POLL.messages : false,
  });
}

// Client context + capabilities. 403/404 here are answers ("not your ticket"), so no retries.
export function useAssistContext(id: string, enabled: boolean) {
  const focused = useIsFocused();
  return useQuery({ queryKey: supKeys.assist(id), queryFn: () => getAssistContext(id), enabled: enabled && !!id, retry: false, refetchInterval: focused ? POLL.assist : false });
}

export function useOperatorSearch(q: string, enabled: boolean) {
  return useQuery({ queryKey: [...supKeys.all, "operators", q.trim()], queryFn: () => listOperators(q), enabled, placeholderData: keepPreviousData, staleTime: 30_000 });
}
