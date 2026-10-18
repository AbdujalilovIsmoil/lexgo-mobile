import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { getClient360 } from "../api/client360Api";
import { deleteUser, getUser, updateUser } from "../api/userAdminApi";
import type { UserEdit } from "./typesAdmin";

export const userKeys = { all: ["admin-users"] as const };

export const useUserDetail = (id: string) => useQuery({ queryKey: [...userKeys.all, "detail", id], queryFn: () => getUser(id), enabled: !!id });
export const useClient360 = (id: string) => useQuery({ queryKey: [...userKeys.all, "360", id], queryFn: () => getClient360(id), enabled: !!id });

export const useUpdateUser = () =>
  useAdminMutation({ mutationFn: ({ id, edit }: { id: string; edit: UserEdit }) => updateUser(id, edit), invalidate: [userKeys.all], success: "ag3.saved" });
export const useDeleteUser = () => useAdminMutation({ mutationFn: (id: string) => deleteUser(id), invalidate: [userKeys.all], success: "ag3.deleted" });
