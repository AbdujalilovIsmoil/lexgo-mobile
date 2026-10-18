import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { filterChats, groupChats, listChats } from "@/entities/chat";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useClientId } from "./useClientId";

// Past conversations, newest activity first, grouped by day; search runs on the device
// (the API has no query parameter).
export function useChatHistory() {
  const clientId = useClientId();
  const [q, setQ] = useState("");
  const needle = useDebounced(q, 150);
  const query = useQuery({ queryKey: ["ai-chats", clientId], queryFn: () => listChats(clientId as string), enabled: !!clientId });
  const groups = useMemo(() => groupChats(filterChats(query.data ?? [], needle)), [query.data, needle]);
  return { query, groups, q, setQ, total: query.data?.length ?? 0, searching: needle.trim().length > 0 };
}
