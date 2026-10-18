import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { assignRole, createRole, getMatrix, listPermissions, listRoles } from "../api/roleApi";
import type { RoleInput } from "./types";

export const roleKeys = { all: ["admin-roles"] as const };

export const useRoles = () => useQuery({ queryKey: [...roleKeys.all, "list"], queryFn: listRoles });
export const usePermissions = () => useQuery({ queryKey: [...roleKeys.all, "permissions"], queryFn: listPermissions, staleTime: 5 * 60_000 });
export const useMatrix = () => useQuery({ queryKey: [...roleKeys.all, "matrix"], queryFn: getMatrix });

// Creating a role changes both the list and the matrix, so the whole module is refetched.
export const useCreateRole = () =>
  useAdminMutation({ mutationFn: (input: RoleInput) => createRole(input), invalidate: [roleKeys.all], success: "admRoles.created" });

export const useAssignRole = () =>
  useAdminMutation({ mutationFn: (v: { userId: string; roleId: string }) => assignRole(v.userId, v.roleId), invalidate: [["admin-users"]], success: "admRoles.assigned" });

// code -> human title of every permission (the matrix may carry bare codes), cached for the whole module.
export function usePermTitles(): Map<string, string> {
  const { data } = usePermissions();
  return useMemo(() => new Map((data ?? []).map((p) => [p.code, p.title])), [data]);
}

export const matchRole = (r: { name: string; title: string }, q: string) => !q.trim() || `${r.title} ${r.name}`.toLowerCase().includes(q.trim().toLowerCase());
