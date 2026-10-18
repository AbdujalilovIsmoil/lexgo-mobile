import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { checkConflict, clientDetail, createClient, listClients, startChat } from "../api/clientApi";

export const clientKeys = { all: ["pro-clients"] as const };

export const useClients = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: [...clientKeys.all, "list"], queryFn: listClients, enabled: authed });
};
export const useClientDetail = (id: string) => useQuery({ queryKey: [...clientKeys.all, "one", id], queryFn: () => clientDetail(id), enabled: !!id, retry: false });
export const useCreateClient = () => useAdminMutation({ mutationFn: createClient, invalidate: [clientKeys.all], success: "aw3.saved" });
export const useConflictCheck = () => useAdminMutation({ mutationFn: checkConflict });
export const useStartChat = () => useAdminMutation({ mutationFn: ({ clientId, sellerId }: { clientId: string; sellerId: string }) => startChat(clientId, sellerId), invalidate: [clientKeys.all] });
