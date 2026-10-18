import { useQuery } from "@tanstack/react-query";
import { usePaged } from "@/shared/lib/usePaged";
import { getOwnerStats } from "../api/statsApi";
import { getDashboard, listWorkload } from "../api/ownerApi";
import { orgKeys } from "./keys";

export const useDashboard = (org: string) => useQuery({ queryKey: orgKeys.dashboard(org), queryFn: () => getDashboard(org), enabled: !!org });
export const useOwnerStats = (org: string) => useQuery({ queryKey: orgKeys.stats(org), queryFn: () => getOwnerStats(org), enabled: !!org, staleTime: 60_000 });

// Orders of the organization's members, optionally of one member / one status (the server pages it).
export const useWorkload = (org: string, member: string, status: string) =>
  usePaged(orgKeys.workload(org, member, status), ({ limit, offset }) => listWorkload(org, { memberId: member, status, limit, offset }), { pageSize: 30, enabled: !!org });
