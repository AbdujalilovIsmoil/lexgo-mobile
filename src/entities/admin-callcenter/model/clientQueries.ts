import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { openClientRoom } from "../api/roomApi";
import { getClientCard, searchClients } from "../api/clientApi";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { chatHref } from "./chatHref";
import { ccKeys } from "./keys";

export const useClientSearch = (q: string) =>
  useQuery({ queryKey: [...ccKeys.clients, "search", q], queryFn: () => searchClients(q), enabled: q.length >= 2, retry: false, placeholderData: keepPreviousData });

// 403 (a role without lookup rights) is shown as a message, so it is not retried.
export const useClientCard = (id: string) => useQuery({ queryKey: [...ccKeys.clients, "card", id], queryFn: () => getClientCard(id), enabled: !!id, retry: false });

// "Message": open the existing secure room with the client (or create it once) and go into it.
export function useOpenClientChat(meId: string) {
  const router = useRouter();
  return useAdminMutation({ mutationFn: (clientUserId: string) => openClientRoom(clientUserId, meId), onSuccess: (roomId) => roomId && router.push(chatHref(roomId)) });
}
