import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { addMember, createOrganization, listCandidates, listMemberships, listOrganizations } from "../api/orgApi";
import { orgKeys } from "./keys";
import type { OrgInput } from "./types";

export const useOrganizations = () => useQuery({ queryKey: orgKeys.list, queryFn: listOrganizations });
export const useMemberships = (org: string) => useQuery({ queryKey: orgKeys.members(org), queryFn: () => listMemberships(org), enabled: !!org });
export const useCandidates = (enabled: boolean) => useQuery({ queryKey: orgKeys.candidates, queryFn: listCandidates, enabled, staleTime: 5 * 60_000 });

export const useCreateOrg = (onSuccess?: (id: string) => void) =>
  useAdminMutation({ mutationFn: (i: OrgInput) => createOrganization(i), invalidate: [orgKeys.list], success: "og1.created", onSuccess: (o) => onSuccess?.(o.id) });

// Same call adds a member and renames an existing one (the backend upserts on user_id).
export const useSaveMember = (org: string, success: string, onSuccess?: () => void) =>
  useAdminMutation({ mutationFn: (v: { userId: string; title: string }) => addMember(org, v.userId, v.title), invalidate: [orgKeys.members(org), orgKeys.dashboard(org)], success, onSuccess: () => onSuccess?.() });
